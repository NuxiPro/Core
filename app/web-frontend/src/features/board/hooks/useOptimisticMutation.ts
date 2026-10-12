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
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<BoardData>(key);
      const extra = opts?.contextExtra?.(vars) ?? {};
      const ctx = { previous, extra } as Ctx;
      qc.setQueryData<BoardData>(key, (old) =>
        old ? optimisticUpdate(vars, old, ctx) : old,
      );
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
