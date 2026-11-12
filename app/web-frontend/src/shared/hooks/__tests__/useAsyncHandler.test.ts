import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAsyncHandler } from "../useAsyncHandler";

describe("useAsyncHandler", () => {
  it("runs the success callback and stops the loading state", async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useAsyncHandler({ onSuccess }));
    const task = vi.fn().mockResolvedValue(undefined);

    await act(async () => {
      await result.current.handle(task);
    });

    expect(task).toHaveBeenCalledOnce();
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(result.current.isSaving).toBe(false);
  });

  it("forwards the error message and stops the loading state", async () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useAsyncHandler({ onError }));
    const task = vi.fn().mockRejectedValue(new Error("Save failed"));

    await act(async () => {
      await result.current.handle(task);
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Save failed");
    });
    expect(result.current.isSaving).toBe(false);
  });

  it("uses a stable message for non-standard errors", async () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useAsyncHandler({ onError }));

    await act(async () => {
      await result.current.handle(async () => {
        throw "unknown error";
      });
    });

    expect(onError).toHaveBeenCalledWith("Erreur inconnue");
  });
});
