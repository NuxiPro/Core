import type { Editor } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    nodeBackground: {
      setNodeBackgroundColor: (backgroundColor: string) => ReturnType;
      unsetNodeBackgroundColor: () => ReturnType;
      toggleNodeBackgroundColor: (backgroundColor: string) => ReturnType;
    };
  }
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
