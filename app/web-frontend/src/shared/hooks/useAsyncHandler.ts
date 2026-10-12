import { useCallback, useRef, useState } from "react";

export function useAsyncHandler(options?: {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const onSuccessRef = useRef(options?.onSuccess);
  const onErrorRef = useRef(options?.onError);
  onSuccessRef.current = options?.onSuccess;
  onErrorRef.current = options?.onError;

  const handle = useCallback(async (fn: () => Promise<unknown>) => {
    setIsSaving(true);
    try {
      await fn();
      onSuccessRef.current?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur inconnue";
      onErrorRef.current?.(msg);
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { isSaving, handle };
}
