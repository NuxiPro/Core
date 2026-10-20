import { Highlight } from "@tiptap/extension-highlight";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Placeholder, Selection } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { type RefObject, useEffect, useRef, useState } from "react";

// Palette + dark-mode des tokens --tt-* (générés par le CLI TipTap,
// déjà compatibles avec la classe .dark de l'application).
import "@/src/layout/md-editor/styles/_variables.scss";

// Le node custom HorizontalRule (punchline: hr dans un wrapper stylable).
import { HorizontalRule } from "@layout/components/tiptap-kit/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import "@layout/components/tiptap-kit/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";

// Icônes (fallback mobile surlignage / lien).
import { ArrowLeftIcon } from "@layout/components/tiptap-kit/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "@layout/components/tiptap-kit/tiptap-icons/highlighter-icon";
import { LinkIcon } from "@layout/components/tiptap-kit/tiptap-icons/link-icon";
import { BlockquoteButton } from "@layout/components/tiptap-kit/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@layout/components/tiptap-kit/tiptap-ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverButton,
  ColorHighlightPopoverContent,
} from "@layout/components/tiptap-kit/tiptap-ui/color-highlight-popover";
// Toolbar — widgets.
import { HeadingDropdownMenu } from "@layout/components/tiptap-kit/tiptap-ui/heading-dropdown-menu";
import {
  LinkButton,
  LinkContent,
  LinkPopover,
} from "@layout/components/tiptap-kit/tiptap-ui/link-popover";
import { ListDropdownMenu } from "@layout/components/tiptap-kit/tiptap-ui/list-dropdown-menu";
import { MarkButton } from "@layout/components/tiptap-kit/tiptap-ui/mark-button";
import { TextAlignButton } from "@layout/components/tiptap-kit/tiptap-ui/text-align-button";
// Toolbar — primitives (la scss est importée par chaque composant TS).
import { Button } from "@layout/components/tiptap-kit/tiptap-ui-primitive/button";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@layout/components/tiptap-kit/tiptap-ui-primitive/toolbar";

import { useIsBreakpoint } from "@/src/shared/hooks/use-is-breakpoint";

import "./notion-editor.css";

export interface MarkdownEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  className?: string;
  height?: number;
  /** Accès impératif à l'éditeur (focus, etc.) : ref rempli après montage. */
  editorRef?: RefObject<EditorHandle | null>;
}

export type EditorHandle = { focus: () => void };

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
}) => (
  <>
    <ToolbarGroup>
      <HeadingDropdownMenu modal={false} levels={[1, 2, 3]} />
      <ListDropdownMenu
        modal={false}
        types={["bulletList", "orderedList", "taskList"]}
      />
      <BlockquoteButton />
      <CodeBlockButton />
    </ToolbarGroup>

    <ToolbarSeparator />

    <ToolbarGroup>
      <MarkButton type="bold" />
      <MarkButton type="italic" />
      <MarkButton type="strike" />
      <MarkButton type="code" />
      <MarkButton type="underline" />
      {!isMobile ? (
        <ColorHighlightPopover />
      ) : (
        <ColorHighlightPopoverButton onClick={onHighlighterClick} />
      )}
      {!isMobile ? (
        <LinkPopover autoOpenOnLinkActive={false} />
      ) : (
        <LinkButton onClick={onLinkClick} />
      )}
    </ToolbarGroup>

    <ToolbarSeparator />

    <ToolbarGroup>
      <TextAlignButton align="left" />
      <TextAlignButton align="center" />
      <TextAlignButton align="right" />
      <TextAlignButton align="justify" />
    </ToolbarGroup>
  </>
);

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link";
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

export default function MarkdownEditor({
  value,
  onChange,
  className,
  height = 160,
  editorRef,
}: MarkdownEditorProps) {
  const isMobile = useIsBreakpoint();
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main",
  );
  const toolbarRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      Markdown,
      Placeholder.configure({ placeholder: "Écrire quelque chose…" }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Typography,
      Highlight.configure({ multicolor: true }),
      HorizontalRule,
      Selection,
    ],
    content: value,
    contentType: "markdown",
    onUpdate: ({ editor }) => {
      onChange(editor.getMarkdown());
    },
  });

  // Remontée contrôlée : réouverture de la modal avec une autre tâche.
  useEffect(() => {
    if (editor && editor.getMarkdown() !== value) {
      editor.commands.setContent(value, { contentType: "markdown" });
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor && editorRef) {
      editorRef.current = { focus: () => editor.commands.focus() };
    }
  }, [editor, editorRef]);

  // Retour sur la vue principale quand on repasse en desktop.
  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  if (!editor) return null;

  return (
    <div
      className={`${className ?? ""} tiptap notion-editor`}
      style={{ height: `${height}px` }}
    >
      <EditorContext.Provider value={{ editor }}>
        <Toolbar ref={toolbarRef}>
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        {/* Pas de focus() forcé au clic : le clic natif sur ProseMirror
            positionne déjà le caret au bon endroit, et un focus() officieux
            casserait la fermeture des popovers (clic dehors = focus = ré-ouvert). */}
        <EditorContent editor={editor} />
      </EditorContext.Provider>
    </div>
  );
}
