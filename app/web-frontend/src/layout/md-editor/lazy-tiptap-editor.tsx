import { lazy, Suspense, type RefObject } from "react";
import type {
  EditorHandle,
  MarkdownEditorProps,
} from "@/src/layout/md-editor";

// Chargement différé : la dépendance TipTap n'est téléchargée que si
// un éditeur est réellement affiché (code-splitting du bundle).
const MarkdownEditor = lazy(() => import("@/src/layout/md-editor"));

export type { EditorHandle };

export function EditorFallback() {
  return (
    <div className="flex items-center justify-center min-h-[180px] text-muted-foreground text-sm">
      Chargement de l'éditeur...
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
