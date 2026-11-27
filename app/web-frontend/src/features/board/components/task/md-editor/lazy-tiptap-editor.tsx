import { lazy, type RefObject, Suspense } from "react";
import type { EditorHandle, MarkdownEditorProps } from "../md-editor";

// Chargement différé : la dépendance TipTap n'est téléchargée que si
// un éditeur est réellement affiché (code-splitting du bundle).
const MarkdownEditor = lazy(() => import("../md-editor"));

export type { EditorHandle };

function EditorFallback({ height = 160 }: { height?: number }) {
  return (
    <div
      className="tiptap notion-editor relative overflow-hidden"
      style={{ height: `${height}px` }}
      role="status"
      aria-busy="true"
      aria-label="Loading editor"
    >
      <span className="sr-only">Loading editor…</span>

      <div aria-hidden="true" className="h-full animate-pulse">
        <div className="flex h-10 items-center gap-2 border-b border-border-subtle px-3">
          <span className="h-5 w-5 rounded bg-skeleton" />
          <span className="h-5 w-5 rounded bg-skeleton" />
          <span className="h-5 w-5 rounded bg-skeleton" />
          <span className="ml-1 h-4 w-px bg-border-subtle" />
          <span className="h-5 w-16 rounded bg-skeleton" />
          <span className="h-5 w-5 rounded bg-skeleton" />
        </div>

        <div className="space-y-3 px-4 py-4">
          <span className="block h-3 w-11/12 rounded bg-skeleton" />
          <span className="block h-3 w-4/5 rounded bg-skeleton" />
          <span className="block h-3 w-3/5 rounded bg-skeleton" />
        </div>
      </div>
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
    <Suspense fallback={<EditorFallback height={props.height ?? 160} />}>
      <MarkdownEditor {...rest} {...(editorRef ? { editorRef } : {})} />
    </Suspense>
  );
}
