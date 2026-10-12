import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import {
  Details,
  DetailsContent,
  DetailsSummary,
} from "@tiptap/extension-details";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { Command } from "cmdk";
import { common, createLowlight } from "lowlight";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/src/shared/utils/utils";
import {
  bubbleFeatures,
  filterSlashFeatures,
  groupedToolbarFeatures,
} from "./editor-features";

const lowlight = createLowlight(common);

export interface EditorHandle {
  getHTML: () => string;
  setHTML: (html: string) => void;
  clear: () => void;
  focus: () => void;
}

interface TipTapEditorProps {
  value: string;
  onChange: (html: string) => void;
  className?: string;
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "flex h-7 min-w-7 items-center justify-center rounded px-1 text-sm transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}

export const TipTapEditor = forwardRef<EditorHandle, TipTapEditorProps>(
  function TipTapEditor({ value, onChange, className }, ref) {
    const { t } = useTranslation();
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const hasSyncedRef = useRef(false);
    const prevValueRef = useRef(value);

    const [slashOpen, setSlashOpen] = useState(false);
    const [slashPos, setSlashPos] = useState({ top: 0, left: 0 });
    const cmdkInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
      shouldRerenderOnTransaction: true,
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
          codeBlock: false,
        }),
        CodeBlockLowlight.configure({
          lowlight,
          defaultLanguage: "javascript",
        }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Details,
        DetailsContent,
        DetailsSummary,
        Placeholder.configure({
          placeholder: t("task.descriptionPlaceholder"),
        }),
      ],
      content: "",
      editorProps: {
        attributes: {
          class: "min-h-[200px] focus:outline-none",
        },
        handleKeyDown: (view, event) => {
          if (
            event.key === "/" &&
            !event.ctrlKey &&
            !event.metaKey &&
            !slashOpen
          ) {
            event.preventDefault();
            const { from } = view.state.selection;
            const coords = view.coordsAtPos(from);
            const containerRect =
              view.dom.closest(".tiptap-container")?.getBoundingClientRect() ??
              view.dom.getBoundingClientRect();
            setSlashPos({
              top: coords.bottom - containerRect.top + 4,
              left: coords.left - containerRect.left,
            });
            setSlashOpen(true);
            return true;
          }
          return false;
        },
      },
      onUpdate: ({ editor: e }) => {
        onChangeRef.current(e.getHTML());
      },
    });

    const executeSlashFeature = useCallback(
      (action: (e: typeof editor) => void) => {
        if (!editor) return;
        action(editor);
        setSlashOpen(false);
        editor.commands.focus();
      },
      [editor],
    );

    const slashItems = editor ? filterSlashFeatures("") : [];
    const toolbarGroups = groupedToolbarFeatures();

    useImperativeHandle(
      ref,
      () => ({
        getHTML: () => editor?.getHTML() ?? "",
        setHTML: (html: string) => editor?.commands.setContent(html),
        clear: () => editor?.commands.clearContent(),
        focus: () => editor?.commands.focus(),
      }),
      [editor],
    );

    useEffect(() => {
      if (!editor || !value) return;
      try {
        if (!hasSyncedRef.current) {
          hasSyncedRef.current = true;
          prevValueRef.current = value;
          editor.commands.setContent(value);
          return;
        }
        if (prevValueRef.current === value) return;
        prevValueRef.current = value;
        if (editor.getHTML().trim() !== value.trim()) {
          editor.commands.setContent(value);
        }
      } catch {
        /* editor not ready */
      }
    }, [value, editor]);

    useEffect(() => {
      if (!slashOpen) return;
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest("[data-slash-menu]")) {
          setSlashOpen(false);
          editor?.commands.focus();
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [slashOpen, editor]);

    useEffect(() => {
      if (slashOpen) {
        requestAnimationFrame(() => cmdkInputRef.current?.focus());
      }
    }, [slashOpen]);

    if (!editor) return null;

    return (
      <div className={cn("flex flex-col tiptap-container", className)}>
        <div className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5">
          {toolbarGroups.map((group, groupIndex) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: toolbar groups are static
            <div key={`group-${groupIndex}`} className="flex items-center">
              {groupIndex > 0 && <Divider />}
              {group.map((feature) => (
                <ToolbarButton
                  key={feature.id}
                  title={feature.label}
                  active={feature.isActive(editor)}
                  onClick={() => feature.action(editor)}
                >
                  {feature.icon}
                </ToolbarButton>
              ))}
            </div>
          ))}
        </div>

        <div className="relative min-h-[200px]">
          <BubbleMenu
            editor={editor}
            className="flex items-center gap-0.5 rounded-lg border bg-popover p-1 shadow-xl"
          >
            {bubbleFeatures.map((feature) => (
              <ToolbarButton
                key={feature.id}
                title={feature.label}
                active={feature.isActive(editor)}
                onClick={() => feature.action(editor)}
              >
                {feature.icon}
              </ToolbarButton>
            ))}
          </BubbleMenu>

          <EditorContent
            editor={editor}
            className="px-3 py-2 min-h-[200px] [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-empty]:before:text-muted-foreground [&_.ProseMirror_p.is-empty]:before:content-[attr(data-placeholder)] [&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:text-muted-foreground [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_pre]:bg-muted [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre_code]:bg-transparent [&_.ProseMirror_pre_code]:p-0 [&_.ProseMirror_details]:border [&_.ProseMirror_details]:rounded-lg [&_.ProseMirror_details]:p-2 [&_.ProseMirror_details_summary]:cursor-pointer [&_.ProseMirror_details_summary]:select-none [&_.ProseMirror_details_summary]:font-semibold [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_li]:py-0.5 [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-2 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mb-1 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-border [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:text-muted-foreground"
            onClick={() => editor.commands.focus()}
          />

          {slashOpen && slashItems.length > 0 && (
            <div
              role="menu"
              data-slash-menu
              style={{ top: slashPos.top, left: slashPos.left }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setSlashOpen(false);
                  editor.commands.focus();
                }
              }}
              className="absolute z-50 w-64 overflow-hidden rounded-lg border bg-popover p-1 shadow-xl"
            >
              <Command loop shouldFilter>
                <Command.Input
                  ref={cmdkInputRef}
                  autoFocus
                  placeholder="Rechercher..."
                  className="border-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
                />
                <Command.List>
                  <Command.Empty className="px-2 py-1.5 text-xs text-muted-foreground">
                    Aucun résultat
                  </Command.Empty>
                  {slashItems.map((feature) => (
                    <Command.Item
                      key={feature.id}
                      value={`${feature.label} ${feature.keywords ?? ""}`}
                      onSelect={() => executeSlashFeature(feature.action)}
                      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-popover-foreground outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded border bg-muted text-xs font-medium text-muted-foreground">
                        {feature.icon}
                      </span>
                      {feature.label}
                    </Command.Item>
                  ))}
                </Command.List>
              </Command>
            </div>
          )}
        </div>
      </div>
    );
  },
);
