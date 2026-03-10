/**
 * Decodes HTML entities in LaTeX so the clipboard receives plain text (e.g. &amp; -> &).
 */
export function decodeLatexFromAnnotation(html: string | null | undefined): string {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").trim();
}

/**
 * Walks a fragment/node tree in document order and builds a Notion-friendly string.
 * - Plain text is kept with spaces normalized.
 * - KaTeX equations become $<latex>$.
 * - Basic structure (headings, paragraphs, list items, line breaks) is preserved
 *   using lightweight Markdown-style formatting so Notion keeps the layout.
 */
export function getNotionFormatFromFragment(
  node: Node | DocumentFragment | null | undefined
): string {
  let out = "";
  if (!node) return out;

  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent || "").replace(/[ \t]+/g, " ");
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;

    // KaTeX equation: wrap original LaTeX in $<...>$ for the Notion workflow.
    if ((el as HTMLElement).classList && (el as HTMLElement).classList.contains("katex")) {
      const annotation = el.querySelector(".katex-mathml annotation");
      const raw = annotation ? annotation.innerHTML : "";
      const latex = decodeLatexFromAnnotation(raw);
      return latex ? `$<${latex}>$` : "";
    }

    const tag = el.tagName;

    if (tag === "BR") {
      return "\n";
    }

    for (let i = 0; i < el.childNodes.length; i++) {
      out += getNotionFormatFromFragment(el.childNodes[i]);
    }

    if (tag === "B" || tag === "STRONG") {
      const inner = out.trim();
      return inner ? `**${inner}**` : "";
    }

    if (tag === "I" || tag === "EM") {
      const inner = out.trim();
      return inner ? `*${inner}*` : "";
    }

    if (tag && /^H[1-6]$/.test(tag)) {
      const level = parseInt(tag.substring(1), 10) || 1;
      const hashes = "#".repeat(Math.min(level, 3));
      const inner = out.trim();
      return inner ? `${hashes} ${inner}\n\n` : "";
    }

    if (tag === "LI") {
      const inner = out.trim();
      return inner ? `- ${inner}\n` : "";
    }

    if (tag === "P" || tag === "DIV" || tag === "SECTION" || tag === "ARTICLE") {
      const inner = out.trim();
      return inner ? `${inner}\n\n` : "";
    }

    // Default: just return concatenated children
    return out;
  }

  if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
    const fragment = node as DocumentFragment;
    for (let i = 0; i < fragment.childNodes.length; i++) {
      out += getNotionFormatFromFragment(fragment.childNodes[i]);
    }
  }

  return out;
}

/**
 * Builds a single string for Notion from the current selection.
 * Keeps equations as $<latex>$ segments and preserves basic layout
 * (headings, paragraphs, lists).
 */
export function getNotionFormatFromSelection(selection: Selection | null): string {
  if (!selection || selection.rangeCount === 0) return "";
  const range = selection.getRangeAt(0);
  const fragment = range.cloneContents();
  const raw = getNotionFormatFromFragment(fragment);
  let normalized = (raw || "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n");

  // For block equations copied from ChatGPT we want an extra blank line
  // after each standalone $<...>$ line so that Notion creates a separate
  // block. A "standalone" equation is a line whose non-whitespace content
  // consists only of a single $<...>$.
  normalized = normalized.replace(
    /(^|\n)(\s*\$<[^\n]*>\$\s*)(\n)(?!\n)/g,
    "$1$2$3\n"
  );

  return normalized.trim();
}

