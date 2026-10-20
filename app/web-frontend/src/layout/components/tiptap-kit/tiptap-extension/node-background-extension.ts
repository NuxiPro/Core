import type { Editor, NodeWithPos } from "@tiptap/core";
import { Extension } from "@tiptap/core";
import type { EditorState, Transaction } from "@tiptap/pm/state";
import {
  getSelectedNodesOfType,
  updateNodesAttr,
} from "@/src/shared/lib/tiptap-utils";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    nodeBackground: {
      setNodeBackgroundColor: (backgroundColor: string) => ReturnType;
      unsetNodeBackgroundColor: () => ReturnType;
      toggleNodeBackgroundColor: (backgroundColor: string) => ReturnType;
    };
  }
}

export interface NodeBackgroundOptions {
  /**
   * Node types that should support background colors
   * @default ["paragraph", "heading", "blockquote", "taskList", "bulletList", "orderedList", "tableCell", "tableHeader"]
   */
  types: string[];
  /**
   * Use inline style instead of data attribute
   * @default true
   */
  useStyle?: boolean;
  /**
   * The node attribute that stores the color. Set it to an attribute the
   * node types already define, such as ConvertKit's `background` on table
   * cells, so the color lands where those nodes render and export it.
   * @default "backgroundColor"
   */
  attributeName: string;
}

const DEFAULT_ATTRIBUTE_NAME = "backgroundColor";

/**
 * The attribute the editor's NodeBackground extension writes, for UI that
 * reads the color back. Returns the default when the extension is missing.
 */
export function getNodeBackgroundAttributeName(editor: Editor | null): string {
  const attributeName: unknown = editor?.extensionManager.extensions.find(
    (extension) => extension.name === "nodeBackground",
  )?.options.attributeName;

  return typeof attributeName === "string"
    ? attributeName
    : DEFAULT_ATTRIBUTE_NAME;
}

/**
 * Determines the target color for toggle operations
 */
function getToggleColor(
  targets: NodeWithPos[],
  attributeName: string,
  inputColor: string,
): string | null {
  if (targets.length === 0) return null;

  for (const target of targets) {
    const currentColor = target.node.attrs?.[attributeName] ?? null;
    if (currentColor !== inputColor) {
      return inputColor;
    }
  }

  return null;
}
