import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BoardData } from "../types/board";

type Ctx = { previous: BoardData | undefined; extra: Record<string, unknown> };

export function useOptimisticMutation<TData, TVars>(
  projectId: string | null,
  mutationFn: (v: TVars) => Promise<TData>,
  optimisticUpdate: (v: TVars, old: BoardData, ctx: Ctx) => BoardData,
  opts?: {
    onSuccess?: (data: TData, vars: TVars, ctx: Ctx) => void;
    contextExtra?: (v: TVars) => Record<string, unknown>;
    invalidateOnSettled?: boolean;
  },
) {
  const qc = useQueryClient();
  const key = ["board", projectId] as const;

  return useMutation({
    mutationFn,
    onMutate: async (vars) => {
      const previous = qc.getQueryData<BoardData>(key);
      const extra = opts?.contextExtra?.(vars) ?? {};
      // Optimistic apply 100% sync: flush dans le même batch React que le
      // cleanup du drag (setActiveTask(null) dans onDragEnd). Un await
      // cancelQueries avant le splice crée un gap async où la carte revient
      // une frame à son ancienne position (le "flash" au drop).
      const ctx = { previous, extra } as Ctx;
      qc.setQueryData<BoardData>(key, (old) =>
        old ? optimisticUpdate(vars, old, ctx) : old,
      );
      // Annule les refetch in-flight APRÈS application, sans await : sinon
      // le paint optimiste serait retardé.
      qc.cancelQueries({ queryKey: key }).catch(() => {});
      return ctx;
    },
    onError: (_e, _v, ctx) => {
      if ((ctx as Ctx | undefined)?.previous)
        qc.setQueryData(key, (ctx as Ctx).previous);
    },
    ...(opts?.onSuccess
      ? {
          onSuccess: opts.onSuccess as unknown as (
            d: TData,
            v: TVars,
            ctx: Ctx,
          ) => unknown,
        }
      : {}),
    // Mutations that receive the authoritative server state can skip a redundant refetch.
    onSettled: () => {
      if (opts?.invalidateOnSettled !== false) {
        return qc.invalidateQueries({ queryKey: key });
      }
    },
  });
}
