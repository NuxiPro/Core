import { lazy, type RefObject, Suspense } from "react";
import type { EditorHandle, MarkdownEditorProps } from "../md-editor";

// Chargement différé : la dépendance TipTap n'est téléchargée que si
// un éditeur est réellement affiché (code-splitting du bundle).
const MarkdownEditor = lazy(() => import("../md-editor"));

export type { EditorHandle };

function EditorFallback() {
  return (
    <div className="flex items-center justify-center min-h-[180px] text-muted-foreground text-sm">
      Loading editor...
    </div>
  );
}

export function LazyTipTapEditorWithSuspense(
  props: MarkdownEditorProps & {
    editorRef?: RefObject<EditorHandle | null>;
  },
) {
  const { editorRef, ...rest } = props;
  return (
    <Suspense fallback={<EditorFallback />}>
      <MarkdownEditor {...rest} {...(editorRef ? { editorRef } : {})} />
    </Suspense>
  );
}
