// Sanitize HTML using DOMPurify – robust protection against XSS
// Falls back to a minimal regex‑based clean‑up when `document` is not available (e.g. server‑side tests).
import DOMPurify from "dompurify";

export function sanitizeHtml(html: string): string {
  if (!html) return "";

  // Server‑side (no DOM) – keep the simple fallback that strips <script> tags and inline event handlers.
  if (typeof document === "undefined") {
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/\son\w+="[^"]*"/gi, "");
  }

  // Browser side – use DOMPurify with a restrictive whitelist.
  // Whitelist = exactement le markup que l'éditeur Tiptap produit
  // (tiptap-editor). TOUT ce qui manque ici est effacé au retour de la
  // boucle onChange → setContent (les blocs disparaissent visuellement),
  // et TOUT ce qui est en trop serait du HTML non produit par l'éditeur.
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "a",
      "b",
      "i",
      "u",
      "strong",
      "em",
      "p",
      "ul",
      "ol",
      "li",
      "br",
      "span",
      "div",
      "img",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "pre",
      "code",
      // Barré natif de Tiptap v3 (starter-kit devient <s>).
      "s",
      "del",
      "mark",
      "hr",
      "details",
      "summary",
      // Liste de tâches : <label><input type="checkbox">…</label>
      "label",
      "input",
    ],
    ALLOWED_ATTR: [
      "href",
      "title",
      "target",
      "rel",
      "src",
      "alt",
      "class",
      "style",
      // Nœuds Tiptap : ul[data-type=taskList], li[data-type=taskItem],
      // data-checked=; code: class=language-* ; ol: start ;
      // mark: data-color (surlignage multicolore).
      "data-type",
      "data-checked",
      "data-color",
      "start",
      // Case à cocher de la liste de tâches.
      "type",
      "checked",
      "disabled",
    ],
    // ADD_URI_SAFE_ATTR : ces attrs à valeur sinistrés par la porte URI
    // (notre ALLOWED_URI_REGEXP). Ce sont des attrs inertes (type sur
    // input, start sur ol) — on les déclare URI-safes ; javascript:,
    // data:, vbscript: restent bloqués comme avant pour href/src.
    ADD_URI_SAFE_ATTR: ["type", "start"],
    // Only allow safe protocols – block javascript:, data:, vbscript:, etc.
    ALLOWED_URI_REGEXP: /^(https?|mailto|tel):/i,
    // Prevent the creation of <style> elements (they can contain XSS via CSS expressions).
    FORBID_TAGS: ["style"],
  });

  return clean as string;
}
