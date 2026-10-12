# Hooks `board`

Couche d'accès aux données et d'interaction du kanban. Tous les hooks lisent/écrivent le cache TanStack Query ; le serveur reste l'autorité sur les positions (`positionString`, fractional-indexing).

Clé de cache centrale : `["board", projectId]` (`BoardData` : métadonnées projet + `tasks` plates, regroupées/triées par `KanbanBoard` via `tasksByColumn`).

## `useTasks.ts`

Lecture + mutations CRUD du board.

- `useQuery(["board", projectId])` → `tasks`, `prefix`, `projectName`, `isLoading` (`enabled: !!projectId`, `staleTime` 2 min).
- `addTask` : insère une tâche temporaire (`tempId`, `positionString: "n"`), remplacée par la tâche serveur dans `onSuccess`.
- `updateTask` : patch optimiste du cache + refresh du cache détail `["task", id]`.
- `deleteTask` : retrait optimiste (rollback auto en cas d'erreur).
- `useTaskDetail(taskId)` : query détail lazy (`enabled: !!taskId`).

## `useReorderTask.ts`

Déplacement drag & drop (`PATCH updateTaskPosition`).

- Update optimiste **réel** : recalcule une clé `generateKeyBetween()` locale entre les voisins triés de la colonne cible, pour un affichage immédiat du drop.
- `onSuccess` : écrase avec `newPosition` serveur (autorité), sans refetch (`invalidateOnSettled: false`).
- Échec de génération locale (clés serrées) : garde l'ancienne position, le serveur corrige.

## `useKanbanDnd.ts`

Logique dnd-kit (`DndContext`) : capteurs, collision, décision de drop. Ne fait aucun réseau, délègue à `onMoveTask`.

- `collisionDetection` : préfère les cartes aux colonnes (`pointerWithin` puis `rectIntersection` filtrés).
- `isTopHalf` : `pointerY (clientY + delta) < centre over` → `insertBefore` (comparaison directe, sans zone morte).
- `targetCol` : colonne cible depuis `overId` (colonne ou carte qu'elle contient).
- `resolveOverTaskId` : drop sur colonne → dernière tâche (`append`), sinon `overId`.
- `isSamePosition` : abort sans appel réseau si le drop ne change rien.
- `handleDragEnd` : aborts (`!overId`, self-drop, colonne inconnue, `samePos`), throttle 300 ms, `409` → log + `alert` en dev.
- Retourne `activeTask` (overlay), `sensors`, handlers. Logger `KanbanDnd`.

## `useOptimisticMutation.ts`

Fabrique générique `useMutation` optimiste sur `["board", projectId]` : `cancelQueries` → snapshot `previous` → `setQueryData(optimisticUpdate)` → rollback `onError` → `onSuccess` optionnel → `invalidateQueries` sauf `invalidateOnSettled: false`.

## `useProjects.ts` / `useWorkspaces.ts`

Queries lecture seule : `["projects"]` (`staleTime` 1 min) et `["workspaces"]` (`staleTime` 10 min, `gcTime` 30 min).
