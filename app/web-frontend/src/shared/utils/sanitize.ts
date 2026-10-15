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
  // Adjust the whitelist as needed for the UI (currently includes the tags/attrs we use in the app).
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
    ],
    // Only allow safe protocols – block javascript:, data:, vbscript:, etc.
    ALLOWED_URI_REGEXP: /^(https?|mailto|tel):/i,
    // Prevent the creation of <style> elements (they can contain XSS via CSS expressions).
    FORBID_TAGS: ["style"],
  });

  return clean as string;
}

