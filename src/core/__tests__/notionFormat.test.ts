import {
  decodeLatexFromAnnotation,
  getNotionFormatFromFragment,
  getNotionFormatFromSelection,
} from "../notionFormat";

function createSelectionForNode(node: Node): Selection {
  const range = document.createRange();
  range.selectNodeContents(node);
  const sel = window.getSelection();
  if (!sel) {
    throw new Error("No selection available");
  }
  sel.removeAllRanges();
  sel.addRange(range);
  return sel;
}

describe("notionFormat", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("decodeLatexFromAnnotation", () => {
    it("decodes basic HTML entities", () => {
      expect(decodeLatexFromAnnotation("x &amp; y &lt; z")).toBe("x & y < z");
    });

    it("returns empty string for null/undefined/empty", () => {
      expect(decodeLatexFromAnnotation(null)).toBe("");
      expect(decodeLatexFromAnnotation(undefined)).toBe("");
      expect(decodeLatexFromAnnotation("")).toBe("");
    });
  });

  describe("getNotionFormatFromFragment", () => {
    it("normalizes whitespace in text nodes", () => {
      const div = document.createElement("div");
      div.textContent = "foo   \t bar";
      const frag = document.createDocumentFragment();
      frag.appendChild(div);
      const result = getNotionFormatFromFragment(frag);
      expect(result).toBe("foo bar\n\n");
    });

    it("wraps KaTeX equations as $<latex>$", () => {
      const root = document.createElement("div");
      const katex = document.createElement("span");
      katex.className = "katex";

      const mathml = document.createElement("span");
      mathml.className = "katex-mathml";
      const annotation = document.createElement("annotation");
      annotation.innerHTML = "x^2 &amp; y";
      mathml.appendChild(annotation);
      katex.appendChild(mathml);
      root.appendChild(katex);

      const frag = document.createDocumentFragment();
      frag.appendChild(root);

      const result = getNotionFormatFromFragment(frag);
      expect(result).toBe("$<x^2 & y>$\n\n");
    });

    it("handles structural elements and inline formatting", () => {
      const root = document.createElement("div");

      const p = document.createElement("p");
      p.textContent = "para";
      root.appendChild(p);

      const strong = document.createElement("strong");
      strong.textContent = "bold";
      root.appendChild(strong);

      const em = document.createElement("em");
      em.textContent = "ital";
      root.appendChild(em);

      const h2 = document.createElement("h2");
      h2.textContent = "Heading";
      root.appendChild(h2);

      const li = document.createElement("li");
      li.textContent = "item";
      root.appendChild(li);

      const br = document.createElement("br");
      root.appendChild(br);

      const frag = document.createDocumentFragment();
      frag.appendChild(root);

      const result = getNotionFormatFromFragment(frag);
      expect(result).toContain("para\n\n");
      expect(result).toContain("**bold**");
      expect(result).toContain("*ital*");
      expect(result).toContain("## Heading\n\n");
      expect(result).toContain("- item\n");
      expect(result).toContain("\n");
    });
  });

  describe("getNotionFormatFromSelection", () => {
    it("returns empty string for empty selection", () => {
      const sel = window.getSelection();
      if (!sel) throw new Error("No selection");
      sel.removeAllRanges();
      expect(getNotionFormatFromSelection(sel)).toBe("");
    });

    it("adds extra blank line after standalone equation lines", () => {
      const container = document.createElement("div");
      container.innerHTML = `
        <p>Before</p>
        <p><span class="katex"><span class="katex-mathml"><annotation>x^2</annotation></span></span></p>
        <p>After</p>
      `;
      document.body.appendChild(container);

      const selection = createSelectionForNode(container);
      const result = getNotionFormatFromSelection(selection);

      // Should contain an isolated $<x^2>$ line followed by two newlines.
      expect(result).toMatch(/\$<x\^2>\$\s*\n\n/);
      expect(result).toContain("Before");
      expect(result).toContain("After");
    });
  });
});

