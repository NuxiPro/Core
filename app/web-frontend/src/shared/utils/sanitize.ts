// Sanitize minimal sans nouvelle dépendance — supprime scripts et handlers
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  // Hors navigateur (tests) : fallback simple
  if (typeof document === "undefined") {
    return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\son\w+="[^"]*"/gi, "");
  }
  const template = document.createElement("template");
  template.innerHTML = html;
  const blockTags = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED"]);
  const walk = (node: Element) => {
    for (const el of Array.from(node.querySelectorAll("*"))) {
      if (blockTags.has(el.tagName)) {
        el.remove();
        continue;
      }
      for (const attr of Array.from(el.attributes)) {
        if (attr.name.startsWith("on") || attr.value.trim().toLowerCase().startsWith("javascript:")) {
          el.removeAttribute(attr.name);
        }
      }
      walk(el);
    }
  };
  walk(template.content as unknown as Element);
  return template.innerHTML;
}
