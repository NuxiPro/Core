import {
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { ColumnId } from "@packages/shared/config/index";
import { COLUMN_IDS } from "@packages/shared/config/index-frontend";
import type { TaskSummary } from "@packages/shared/types/task/task";
import { useRef, useState } from "react";
import { createLogger } from "@/src/shared/api/logger";

const log = createLogger("KanbanDnd");

// Collision précise : on préfère les cartes aux colonnes, évite que la colonne capte le drop
const collisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length) {
    const taskHits = pointerHits.filter(
      (c) => !(COLUMN_IDS as readonly string[]).includes(c.id as string),
    );
    if (taskHits.length) return taskHits;
    return pointerHits;
  }
  const rectHits = rectIntersection(args);
  const taskRectHits = rectHits.filter(
    (c) => !(COLUMN_IDS as readonly string[]).includes(c.id as string),
  );
  return taskRectHits.length ? taskRectHits : rectHits;
};

// Détecte si le drop est sur la moitié haute — comparaison directe pointeur vs centre.
// Pas de zone morte : l'ancien fallback "centre carte active vs centre over"
// inversait la décision à ~1px du centre (ex: 168.8 vs 170.16 → false → abort).
function isTopHalf(e: DragEndEvent): boolean {
  const o = e.over?.rect;
  if (!o) return true;
  const overCenterY = (o.top + o.bottom) / 2;
  const ev = e.activatorEvent as PointerEvent | undefined;
  if (ev && "clientY" in ev) {
    const pointerY = (ev as PointerEvent).clientY + e.delta.y;
    const insertBefore = pointerY < overCenterY;
    log.debug("isTopHalf", { pointerY, overCenterY, insertBefore });
    return insertBefore;
  }
  // Clavier / pas de pointeur : compare les centres.
  const a = e.active.rect.current.translated ?? e.active.rect.current.initial;
  const insertBefore = a ? (a.top + a.bottom) / 2 < overCenterY : true;
  log.debug("isTopHalf", { overCenterY, insertBefore });
  return insertBefore;
}

// Trouve la colonne cible à partir de l'id survolé
function targetCol(
  overId: string,
  byCol: Record<string, TaskSummary[]>,
): ColumnId | undefined {
  if ((COLUMN_IDS as readonly string[]).includes(overId))
    return overId as ColumnId;
  for (const c of COLUMN_IDS)
    if (byCol[c]?.some((t) => t.id === overId)) return c;
  return undefined;
}

// Feedback erreur POST-move : 409 → toast léger (dev only : alert).
function logMoveError(err: unknown, payload: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  const is409 =
    msg.includes("409") ||
    msg.includes("PositionImpossible") ||
    msg.includes("position");
  if (is409) {
    log.warn("moveTask: position impossible", { payload, error: msg });
    // simple feedback sans dépendance toast : alert DEV only, sinon silencieux + rollback déjà fait
    if (typeof window !== "undefined" && !import.meta.env.PROD)
      window.alert("Position impossible, réessayez");
  }
  log.debug("onMoveTask error", { payload, error: String(err) });
}

export function useKanbanDnd({
  tasksByColumn,
  onMoveTask,
}: {
  tasksByColumn: Record<ColumnId, TaskSummary[]>;
  onMoveTask: (p: {
    taskId: string;
    colId: ColumnId;
    overTaskId: string | null;
    insertBefore: boolean;
  }) => Promise<unknown>;
}) {
  const [activeTask, setActiveTask] = useState<TaskSummary | null>(null);
  const lastMoveAt = useRef(0); // throttle 300ms sans re-render

  const sensors = useSensors(
    // Séparation souris / tactile (pattern Kaneo) :
    // - souris : drag à 8px de mouvement → un clic simple déclenche JAMAIS le drag
    // - tactile : délai 250ms pour laisser le tap passer, tolérance 10px de glissement
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 10 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    const id = active.id as string;
    for (const c of COLUMN_IDS) {
      const t = tasksByColumn[c]?.find((x) => x.id === id);
      if (t) {
        setActiveTask(t);
        log.debug("dragStart", { activeId: id, colId: t.colId, task: t });
        return;
      }
    }
    setActiveTask(null);
    log.debug("dragStart: task not found", { activeId: id, tasksByColumn });
  };

  // Si on survole la colonne vide, on cible la dernière tâche (append en fin)
  function resolveOverTaskId(
    isCol: boolean,
    colId: ColumnId,
    overId: string,
  ): string | null {
    if (isCol) return tasksByColumn[colId]?.at(-1)?.id ?? null;
    return overId;
  }

  // Évite un appel réseau si la position n'a pas changé
  function isSamePosition(
    colId: ColumnId,
    activeId: string,
    overTaskId: string | null,
    isCol: boolean,
    insertBefore: boolean,
  ): boolean {
    if (activeTask?.colId !== colId) return false;
    const list = tasksByColumn[colId] ?? [];
    const from = list.findIndex((t) => t.id === activeId);
    if (from === -1) return false;
    const to = isCol
      ? list.length
      : (() => {
          const idx = list.findIndex((t) => t.id === overTaskId);
          if (idx === -1) return -1;
          return insertBefore ? idx : idx + 1;
        })();
    const adjTo = to > from ? to - 1 : to;
    return adjTo === from;
  }

  const handleDragEnd = async (e: DragEndEvent) => {
    const activeId = e.active.id as string;
    const overId = e.over?.id as string | undefined;

    log.debug("dragEnd raw", {
      activeId,
      overId,
      delta: e.delta,
      activeRect: e.active.rect.current.initial,
      overRect: e.over?.rect,
    });

    if (!overId || activeId === overId) {
      log.debug("abort: no over or self-drop", { activeId, overId });
      setActiveTask(null);
      return;
    }

    const colId = targetCol(overId, tasksByColumn);
    if (!colId) {
      log.debug("abort: colId not found", { overId, tasksByColumn });
      setActiveTask(null);
      return;
    }

    const isCol = (COLUMN_IDS as readonly string[]).includes(overId);
    const overTaskId = resolveOverTaskId(isCol, colId, overId);
    const insertBefore = isCol ? false : isTopHalf(e);
    const samePos = isSamePosition(
      colId,
      activeId,
      overTaskId,
      isCol,
      insertBefore,
    );

    log.debug("resolved", {
      activeId,
      activeCol: activeTask?.colId,
      overId,
      colId,
      isCol,
      overTaskId,
      insertBefore,
      samePos,
      tasksByColumn,
    });

    if (samePos) {
      log.debug("abort: isSamePosition true");
      setActiveTask(null);
      return;
    }

    // Throttle 300ms — évite spam PATCH si drag jitter
    const now = Date.now();
    if (now - lastMoveAt.current < 300) {
      log.debug("throttled drag", { elapsed: now - lastMoveAt.current });
      setActiveTask(null);
      return;
    }
    lastMoveAt.current = now;

    const payload = { taskId: activeId, colId, overTaskId, insertBefore };
    log.debug("→ onMoveTask", payload);

    // Ferme l'overlay immédiatement : la carte réapparaît à sa place
    // sans attendre le réseau (l'update optimiste a déjà bougé la carte).
    setActiveTask(null);
    try {
      await onMoveTask(payload);
      log.debug("onMoveTask success", payload);
    } catch (err) {
      logMoveError(err, payload);
      throw err;
    }
  };

  return {
    activeTask,
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragEnd,
    handleDragCancel: () => setActiveTask(null),
  };
}
