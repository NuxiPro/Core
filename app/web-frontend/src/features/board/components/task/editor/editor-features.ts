import type { Editor } from "@tiptap/core";

export type FeatureGroup = "inline" | "list" | "block" | "insert";

export interface EditorFeature {
  id: string;
  group: FeatureGroup;
  icon: string;
  label: string;
  keywords?: string;
  showInToolbar?: boolean;
  showInSlash?: boolean;
  showInBubble?: boolean;
  isActive: (editor: Editor) => boolean;
  action: (editor: Editor) => void;
}

export const EDITOR_FEATURES: EditorFeature[] = [
  // --- Formatage inline ---
  {
    id: "bold",
    group: "inline",
    icon: "B",
    label: "Gras",
    keywords: "bold gras fort",
    showInToolbar: true,
    showInBubble: true,
    isActive: (e) => e.isActive("bold"),
    action: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    id: "italic",
    group: "inline",
    icon: "I",
    label: "Italique",
    keywords: "italic italique penche",
    showInToolbar: true,
    showInBubble: true,
    isActive: (e) => e.isActive("italic"),
    action: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    id: "strike",
    group: "inline",
    icon: "S",
    label: "Barré",
    keywords: "strike barre supprime",
    showInToolbar: true,
    showInBubble: true,
    isActive: (e) => e.isActive("strike"),
    action: (e) => e.chain().focus().toggleStrike().run(),
  },

  // --- Listes ---
  {
    id: "bulletList",
    group: "list",
    icon: "•≡",
    label: "Liste à puces",
    keywords: "liste puces bullet ul",
    showInToolbar: true,
    showInSlash: true,
    isActive: (e) => e.isActive("bulletList"),
    action: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    id: "orderedList",
    group: "list",
    icon: "1≡",
    label: "Liste numérotée",
    keywords: "liste numerotee ordered ol chiffres",
    showInToolbar: true,
    showInSlash: true,
    isActive: (e) => e.isActive("orderedList"),
    action: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    id: "taskList",
    group: "list",
    icon: "☑",
    label: "Liste de tâches",
    keywords: "liste taches task check todo",
    showInToolbar: true,
    showInSlash: true,
    isActive: (e) => e.isActive("taskList"),
    action: (e) => e.chain().focus().toggleTaskList().run(),
  },

  // --- Blocs ---
  {
    id: "details",
    group: "block",
    icon: "▶",
    label: "Titre dépliable",
    keywords: "details summary depliable toggle headings notion accordion",
    showInToolbar: true,
    showInSlash: true,
    isActive: () => false,
    action: (e) => e.chain().focus().setDetails().run(),
  },
  {
    id: "codeBlock",
    group: "block",
    icon: "{ }",
    label: "Bloc de code",
    keywords: "code bloc codeblock pre lowlight",
    showInToolbar: true,
    showInSlash: true,
    isActive: (e) => e.isActive("codeBlock"),
    action: (e) => e.chain().focus().toggleCodeBlock().run(),
  },

  // --- Séparateur ---
  {
    id: "horizontalRule",
    group: "insert",
    icon: "—",
    label: "Séparateur",
    keywords: "separateur divider rule trait ligne hr",
    showInToolbar: true,
    showInSlash: true,
    isActive: () => false,
    action: (e) => e.chain().focus().setHorizontalRule().run(),
  },
];

export const toolbarFeatures = EDITOR_FEATURES.filter((f) => f.showInToolbar);
export const slashFeatures = EDITOR_FEATURES.filter((f) => f.showInSlash);
export const bubbleFeatures = EDITOR_FEATURES.filter((f) => f.showInBubble);

export function groupedToolbarFeatures(): EditorFeature[][] {
  const order: FeatureGroup[] = ["inline", "list", "block", "insert"];
  const map = new Map<FeatureGroup, EditorFeature[]>();
  for (const g of order) map.set(g, []);
  for (const f of toolbarFeatures) {
    map.get(f.group)?.push(f);
  }
  return order.map((g) => map.get(g) ?? []).filter((g) => g.length > 0);
}

export function filterSlashFeatures(query: string): EditorFeature[] {
  if (!query) return slashFeatures;
  const q = query.toLowerCase();
  return slashFeatures.filter(
    (f) =>
      f.label.toLowerCase().includes(q) ||
      f.id.includes(q) ||
      (f.keywords ?? "").includes(q),
  );
}
