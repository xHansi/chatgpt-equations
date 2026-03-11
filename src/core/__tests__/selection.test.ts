import { selectionContainsKatex } from "../selection";

function createSelectionFromHtml(html: string): Selection {
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);
  const range = document.createRange();
  range.selectNodeContents(container);
  const sel = window.getSelection();
  if (!sel) throw new Error("No selection");
  sel.removeAllRanges();
  sel.addRange(range);
  return sel;
}

describe("selectionContainsKatex", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    const sel = window.getSelection();
    if (sel) sel.removeAllRanges();
  });

  it("returns false for null or empty selection", () => {
    expect(selectionContainsKatex(null)).toBe(false);

    const sel = window.getSelection();
    if (!sel) throw new Error("No selection");
    sel.removeAllRanges();
    expect(selectionContainsKatex(sel)).toBe(false);
  });

  it("returns false for collapsed range", () => {
    const text = document.createTextNode("abc");
    document.body.appendChild(text);
    const range = document.createRange();
    range.setStart(text, 1);
    range.collapse(true);
    const sel = window.getSelection();
    if (!sel) throw new Error("No selection");
    sel.removeAllRanges();
    sel.addRange(range);

    expect(selectionContainsKatex(sel)).toBe(false);
  });

  it("returns false when no .katex element present", () => {
    const sel = createSelectionFromHtml("<p>plain text</p>");
    expect(selectionContainsKatex(sel)).toBe(false);
  });

  it("returns true when a .katex element is in the selection", () => {
    const html = `
      <p>before</p>
      <span class="katex">eq</span>
      <p>after</p>
    `;
    const sel = createSelectionFromHtml(html);
    expect(selectionContainsKatex(sel)).toBe(true);
  });
});

