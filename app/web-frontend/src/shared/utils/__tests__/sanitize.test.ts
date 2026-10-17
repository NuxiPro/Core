// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { sanitizeHtml } from "../sanitize";

/* Le sanitize alimente une boucle fermée : onChange → sanitize → value →
   setContent. Tout markup produit par l'éditeur Tiptap doit SURVIRE au
   sanitize, sinon l'éditeur vide le bloc lui-même à la frappe suivante
   (cas réel : la case TODO qui disparaissait instantanément). */

const TASK_LIST_HTML = `<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>todo</p></div></li></ul>`;

describe("sanitizeHtml — boucle de l'éditeur Tiptap", () => {
  it("la liste de tâches (TODO) survit : data-*, label, input, checked", () => {
    const clean = sanitizeHtml(TASK_LIST_HTML);
    expect(clean).toContain('<ul data-type="taskList">');
    expect(clean).toContain('<li data-type="taskItem"');
    expect(clean).toContain('data-checked="false"');
    expect(clean).toContain("<label>");
    expect(clean).toContain('<input type="checkbox"');
  });

  it("la case cochée garde son état", () => {
    const checked = TASK_LIST_HTML.replace(
      'data-checked="false"',
      'data-checked="true"',
    ).replace('<input type="checkbox"', '<input type="checkbox" checked');
    const clean = sanitizeHtml(checked);
    expect(clean).toContain('data-checked="true"');
    expect(clean).toContain("checked");
  });

  it("les blocs de l'éditeur survivent : citation, code, hr, mark, recto details", () => {
    const html = [
      "<blockquote>cité</blockquote>",
      '<pre><code class="language-js">const x = 1;</code></pre>',
      "<hr>",
      '<mark style="background-color: #0f766e">surligné</mark>',
      "<details><summary>titre</summary><p>contenu</p></details>",
      '<ol start="3"><li>troisième</li></ol>',
    ].join("");
    const clean = sanitizeHtml(html);
    for (const tag of [
      "<blockquote>",
      "<pre><code",
      "<hr>",
      "<mark",
      "<details>",
      "<summary>",
      'start="3"',
    ]) {
      expect(clean).toContain(tag);
    }
  });

  it("zéro confiance : script, handler inline, URI javascript restent interdits", () => {
    const malicious =
      '<p onclick="x()">a</p><script>alert(1)</script><a href="javascript:alert(2)">b</a>';
    const clean = sanitizeHtml(malicious);
    expect(clean).not.toContain("script");
    expect(clean).not.toContain("onclick");
    expect(clean).not.toContain("javascript:");
  });
});
