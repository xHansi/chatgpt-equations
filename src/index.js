const katex = require("katex");

class KatexGPT {
  constructor() {
    this.handleRequest();
    this.enableObserver();
    this.setupCopyForNotion();
    this.copyForNotionButton = null;
  }

  enableObserver() {
    setInterval(this.createCopyEquationButtons, 1000);
  }

  createCopyEquationButtons() {
    const equations = Array.from(document.querySelectorAll(".katex"));
    equations.forEach(equation => {
      equation.style.cursor = "pointer";
      equation.classList.add("copyable-equation");
      if (equation.dataset.copyListener !== "true") {
        equation.dataset.copyListener = "true";
        equation.addEventListener("click", () => {
          const ann = equation.querySelector(".katex-mathml annotation");
          const text = this.decodeLatexFromAnnotation(ann ? ann.innerHTML : "");
          if (text) navigator.clipboard.writeText(text);
        });
      }
    });
  }

  /** Returns true if the current selection contains at least one .katex element */
  selectionContainsKatex(selection) {
    if (!selection || selection.rangeCount === 0) return false;
    const range = selection.getRangeAt(0);
    if (range.collapsed) return false;
    const fragment = range.cloneContents();
    return fragment.querySelector && fragment.querySelector(".katex");
  }

  /** Decode HTML entities in LaTeX so clipboard gets plain text (e.g. &amp; -> &) */
  decodeLatexFromAnnotation(html) {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return (div.textContent || div.innerText || "").trim();
  }

  /** Walk a fragment/node tree in document order; build Notion string.
   * - Plain text is kept with spaces normalized.
   * - KaTeX equations become $$latex$ (one trailing $) so that after paste in Notion,
   *   typing the final $ triggers rendering.
   * - Basic structure (headings, paragraphs, list items, line breaks) is preserved
   *   using Markdown-like formatting so Notion can keep layout. */
  getNotionFormatFromFragment(node) {
    let out = "";
    if (!node) return out;

    // Text: collapse spaces/tabs but let structural newlines be added by elements
    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent || "").replace(/[ \t]+/g, " ");
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node;

      // KaTeX equation: use $$latex$ so typing final $ in Notion converts it
      if (el.classList && el.classList.contains("katex")) {
        const annotation = el.querySelector(".katex-mathml annotation");
        const raw = annotation ? annotation.innerHTML : "";
        const latex = this.decodeLatexFromAnnotation(raw);
        return latex ? `$$${latex}$` : "";
      }

      const tag = el.tagName;

      // Explicit line break
      if (tag === "BR") {
        return "\n";
      }

      // Recursively collect children
      for (let i = 0; i < el.childNodes.length; i++) {
        out += this.getNotionFormatFromFragment(el.childNodes[i]);
      }

      // Bold / strong text -> Markdown **bold**
      if (tag === "B" || tag === "STRONG") {
        const inner = out.trim();
        return inner ? `**${inner}**` : "";
      }

      // Italic / emphasis -> Markdown *italic*
      if (tag === "I" || tag === "EM") {
        const inner = out.trim();
        return inner ? `*${inner}*` : "";
      }

      // Headings: map to Markdown-style so Notion can convert on paste
      if (tag && /^H[1-6]$/.test(tag)) {
        const level = parseInt(tag.substring(1), 10) || 1;
        const hashes = "#".repeat(Math.min(level, 3));
        const inner = out.trim();
        return inner ? `${hashes} ${inner}\n\n` : "";
      }

      // List items: prefix with "- "
      if (tag === "LI") {
        const inner = out.trim();
        return inner ? `- ${inner}\n` : "";
      }

      // Paragraph-like blocks: add blank line after
      if (tag === "P" || tag === "DIV" || tag === "SECTION" || tag === "ARTICLE") {
        const inner = out.trim();
        return inner ? `${inner}\n\n` : "";
      }

      // Default: just return concatenated children
      return out;
    }

    // DocumentFragment (e.g. from range.cloneContents()) — walk its children
    if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      for (let i = 0; i < node.childNodes.length; i++) {
        out += this.getNotionFormatFromFragment(node.childNodes[i]);
      }
    }

    return out;
  }

  /** Build a single string for Notion from the current selection.
   * Keeps equations as $$latex$ segments and preserves basic layout (headings, paragraphs, lists). */
  getNotionFormatFromSelection(selection) {
    if (!selection || selection.rangeCount === 0) return "";
    const range = selection.getRangeAt(0);
    const fragment = range.cloneContents();
    const raw = this.getNotionFormatFromFragment(fragment);
    // Normalize spaces but preserve newlines that encode structure
    const normalized = (raw || "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n");
    return normalized.trim();
  }

  /** Copy text to clipboard; use execCommand fallback if clipboard API fails (e.g. in some iframes) */
  copyTextToClipboard(text) {
    if (!text) return Promise.resolve(false);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } finally {
      ta.remove();
    }
    return Promise.resolve(ok);
  }

  showCopyForNotionButton(selection) {
    // Don't replace the button if it's already showing "✓ Copied!" — let it stay until timeout
    if (this.copyForNotionButton && this.copyForNotionButton.classList.contains("gpt-eq-copy-for-notion-done")) {
      return;
    }
    if (this.copyForNotionButton) {
      this.copyForNotionButton.remove();
      this.copyForNotionButton = null;
    }
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const rects = range.getClientRects();
    const lastRect = rects.length ? rects[rects.length - 1] : null;
    if (!lastRect) return;

    // Capture text now; selection is often cleared when user clicks the button
    let textToCopy = this.getNotionFormatFromSelection(selection);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gpt-eq-copy-for-notion";
    btn.textContent = "Copy for Notion";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Use captured text; if empty, try current selection once
      let toCopy = textToCopy;
      if (!toCopy) toCopy = this.getNotionFormatFromSelection(window.getSelection());
      this.copyTextToClipboard(toCopy || "").then((didCopy) => {
        btn.textContent = "✓ Copied!";
        btn.classList.add("gpt-eq-copy-for-notion-done");
        setTimeout(() => {
          if (btn.parentNode) btn.remove();
          this.copyForNotionButton = null;
        }, 1800);
      });
    });
    document.body.appendChild(btn);
    this.copyForNotionButton = btn;

    const padding = 8;
    const rect = btn.getBoundingClientRect();
    const top = lastRect.top - rect.height - padding;
    const left = lastRect.left;
    btn.style.top = `${Math.max(4, top)}px`;
    btn.style.left = `${left}px`;
  }

  hideCopyForNotionButton() {
    if (this.copyForNotionButton) {
      this.copyForNotionButton.remove();
      this.copyForNotionButton = null;
    }
  }

  onSelectionChange() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      this.hideCopyForNotionButton();
      return;
    }
    if (this.selectionContainsKatex(selection)) {
      this.showCopyForNotionButton(selection);
    } else {
      this.hideCopyForNotionButton();
    }
  }

  setupCopyForNotion() {
    this._copyForNotionTimer = null;
    document.addEventListener("mouseup", () => {
      clearTimeout(this._copyForNotionTimer);
      this._copyForNotionTimer = setTimeout(() => this.onSelectionChange(), 80);
    });
    document.addEventListener("selectionchange", () => {
      clearTimeout(this._copyForNotionTimer);
      this._copyForNotionTimer = setTimeout(() => this.onSelectionChange(), 100);
    });
  }

  handleRequest() {
    chrome.runtime.onMessage.addListener(async (request, sender, response) => {
      if (request.action == "PROMPT") {
        this.submitPrompt()
      }
    })
  }

  submitPrompt() {
    const prompt = "From now on, if you need to write a mathematical expression, use katex notation and follow these rules:\n1. If it is a block equation, display it in a single P element and wrap it with double dollar signs like this:\n\n$$e=mc^{2}$$\n\n2. If it is an inline equation, use the two backslash and parenthesis notation of katex, like this: \\(e^{i \\\pi}-1=0\\).\n\nCan you give me an example of a block equation to see that you understand?";

    const inputElement = document.querySelector("textarea");
    inputElement.value = prompt;
    const submitButton = document.querySelector("textarea~button");
    submitButton.disabled = false;
    submitButton.click();
  }

  renderKatex() {
    const elements = Array.from(document.querySelectorAll("p"));
    const katexElements = elements.filter(element => element.innerHTML.includes("$$"))
    katexElements.forEach(element => {
      if (!element.innerHTML.startsWith("$$")) return;
      const expression = element.innerHTML;
      const sliced = expression.slice(2, -2).replace("/\\/g", "\\\\")

      const renderedExpression = katex.renderToString(sliced);
      element.innerHTML = renderedExpression;
      element.style.textAlign = "center";
      element.style.fontSize = "1.05em";
    });
  }

}

const katexGPT = new KatexGPT();