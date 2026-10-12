import { lazy, Suspense } from "react";

const TipTapEditor = lazy(() =>
  import("./tiptap-editor").then((mod) => ({
    default: mod.TipTapEditor,
  })),
);

import type { EditorHandle } from "./tiptap-editor";

export type { EditorHandle };

export function EditorFallback() {
  return (
    <div className="flex items-center justify-center min-h-[180px] text-muted-foreground text-sm">
      Chargement de l'éditeur...
    </div>
  );
}

export function LazyTipTapEditorWithSuspense(
  props: React.ComponentProps<typeof TipTapEditor> & {
    editorRef?: React.RefObject<EditorHandle | null>;
  },
) {
  const { editorRef, ...rest } = props;
  return (
    <Suspense fallback={<EditorFallback />}>
      <TipTapEditor ref={editorRef} {...rest} />
    </Suspense>
  );
}
