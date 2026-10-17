import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import { Placeholder } from "@tiptap/extensions";
import { TaskItem , TaskList } from "@tiptap/extension-list";
import { useEffect } from "react";

import "./notion-editor.css";

export interface MarkdownEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  className?: string;
  height?: number;
}

export type EditorHandle = { focus: () => void };
export const EditorFallback = () => null;

export default function MarkdownEditor({
  value,
  onChange,
  className,
  height = 160,
}: MarkdownEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Placeholder.configure({ placeholder: "Écrire quelque chose…" }),
      TaskList,
        TaskItem.configure({
          nested: true,
      }),
    ],
    content: value,
    contentType: "markdown",
    onUpdate: ({ editor }) => {
      onChange(editor.getMarkdown());
    },
  });

  useEffect(() => {
    if (editor && editor.getMarkdown() !== value) {
      editor.commands.setContent(value, { contentType: "markdown" });
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor) {
      (globalThis as { markdownEditorHandle?: EditorHandle }).markdownEditorHandle = {
        focus: () => editor.commands.focus(),
      };
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      className={`${className ?? ""} tiptap notion-editor`}
      style={{ height: `${height}px` }}
      onClick={() => editor.commands.focus()}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
