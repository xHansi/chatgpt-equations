class NotionCopyGPT {
  constructor() {
    this.setupCopyForNotion();
    this.copyForNotionButton = null;
  }

  /** Returns true if the current selection contains at least one .katex element. */
  selectionContainsKatex(selection) {
    if (!selection || selection.rangeCount === 0) return false;
    const range = selection.getRangeAt(0);
    if (range.collapsed) return false;
    const fragment = range.cloneContents();
    return fragment.querySelector && fragment.querySelector(".katex");
  }

  /** Decodes HTML entities in LaTeX so the clipboard receives plain text (e.g. &amp; -> &). */
  decodeLatexFromAnnotation(html) {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return (div.textContent || div.innerText || "").trim();
  }

  /**
   * Walks a fragment/node tree in document order and builds a Notion-friendly string.
   * - Plain text is kept with spaces normalized.
   * - KaTeX equations become ${latex}$.
   * - Basic structure (headings, paragraphs, list items, line breaks) is preserved
   *   using lightweight Markdown-style formatting so Notion keeps the layout.
   */
  getNotionFormatFromFragment(node) {
    let out = "";
    if (!node) return out;

    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent || "").replace(/[ \t]+/g, " ");
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node;

      // KaTeX equation: wrap original LaTeX in ${...}$ for the Notion workflow.
      if (el.classList && el.classList.contains("katex")) {
        const annotation = el.querySelector(".katex-mathml annotation");
        const raw = annotation ? annotation.innerHTML : "";
        const latex = this.decodeLatexFromAnnotation(raw);
        return latex ? `${'${'}${latex}}$` : "";
      }

      const tag = el.tagName;

      if (tag === "BR") {
        return "\n";
      }

      for (let i = 0; i < el.childNodes.length; i++) {
        out += this.getNotionFormatFromFragment(el.childNodes[i]);
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
      for (let i = 0; i < node.childNodes.length; i++) {
        out += this.getNotionFormatFromFragment(node.childNodes[i]);
      }
    }

    return out;
  }

  /**
   * Builds a single string for Notion from the current selection.
   * Keeps equations as ${latex}$ segments and preserves basic layout
   * (headings, paragraphs, lists).
   */
  getNotionFormatFromSelection(selection) {
    if (!selection || selection.rangeCount === 0) return "";
    const range = selection.getRangeAt(0);
    const fragment = range.cloneContents();
    const raw = this.getNotionFormatFromFragment(fragment);
    const normalized = (raw || "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n");
    return normalized.trim();
  }

  /**
   * Copies text to the clipboard.
   * Uses the modern Clipboard API when available and falls back to document.execCommand.
   */
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

    let textToCopy = this.getNotionFormatFromSelection(selection);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gpt-eq-copy-for-notion";
    btn.textContent = "Copy for Notion";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      let toCopy = textToCopy;
      if (!toCopy) toCopy = this.getNotionFormatFromSelection(window.getSelection());
      const finalText = toCopy || "";

      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ notionCopyText: finalText });
      }

      this.copyTextToClipboard(finalText).then(() => {
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
}

const isChatGptHost =
  location.host.includes("chat.openai.com") || location.host.includes("chatgpt.com");

const isNotionHost =
  location.host.includes("notion.so") || location.host.includes("notion.site");

if (isChatGptHost) {
  new NotionCopyGPT();
}

/**
 * Sets up equation navigation on Notion:
 * - After paste, all ${...}$ segments in the active contenteditable root are collected.
 * - F2 removes the delimiters of the current equation and selects the next one.
 * - Cmd/Ctrl+Shift+E lets Notion render the selection, then removes the delimiters and advances.
 */
if (isNotionHost) {
  let equationTargets = [];
  let equationIndex = 0;
  let currentEditableRoot = null;

  // Asymmetrische Delimiter für Formeln: ${ ... }$
  const OPEN_DELIM = "${";
  const CLOSE_DELIM = "}$";
  const EQUATION_REGEX = /\$\{([\s\S]*?)\}\$/g;

  const getCurrentEditableRoot = () => {
    let el = document.activeElement;
    while (el && !el.isContentEditable) {
      el = el.parentElement;
    }
    return el || null;
  };

  const deleteRangeSafely = (range) => {
    if (!range) return;
    const startNode = range.startContainer;
    const endNode = range.endContainer;
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;

    if (
      startNode === endNode &&
      startNode.nodeType === Node.TEXT_NODE &&
      typeof startOffset === "number" &&
      typeof endOffset === "number"
    ) {
      const text = startNode.textContent || "";
      const before = text.slice(0, startOffset);
      const after = text.slice(endOffset);
      startNode.textContent = before + after;
      return;
    }

    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
    try {
      document.execCommand("delete");
    } catch {
      // ignore
    }
    sel.removeAllRanges();
  };

  // Sammelt Ranges für alle ${...}$-Vorkommen, auch wenn sie sich über mehrere
  // Textknoten erstrecken. Für jede Formel werden drei Ranges geliefert:
  // inner (nur Inhalt), left (linkes "${") und right (rechtes "}$").
  const collectEquationRanges = (root) => {
    const textNodes = [];
    const offsets = [];
    let totalLength = 0;

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent || "";
      if (!text.length) continue;
      textNodes.push(node);
      offsets.push(totalLength);
      totalLength += text.length;
    }

    const fullText = textNodes.map((n) => n.textContent || "").join("");
    const targets = [];

    const indexToNodeOffset = (index) => {
      if (!textNodes.length) return { node: null, offset: 0 };
      for (let i = 0; i < textNodes.length; i++) {
        const start = offsets[i];
        const end = start + (textNodes[i].textContent || "").length;
        // Halb-offene Intervalle [start, end)
        if (index >= start && index < end) {
          return { node: textNodes[i], offset: index - start };
        }
      }
      // Falls wir genau am Ende landen, auf das Ende des letzten Knotens mappen
      const lastNode = textNodes[textNodes.length - 1];
      return { node: lastNode, offset: (lastNode.textContent || "").length };
    };

    const createRangeFromIndexes = (startIndex, endIndex) => {
      const startPos = indexToNodeOffset(startIndex);
      const endPos = indexToNodeOffset(endIndex);
      if (!startPos.node || !endPos.node) return null;
      const r = document.createRange();
      r.setStart(startPos.node, startPos.offset);
      r.setEnd(endPos.node, endPos.offset);
      return r;
    };

    EQUATION_REGEX.lastIndex = 0;
    let match;
    while ((match = EQUATION_REGEX.exec(fullText)) !== null) {
      const allStart = match.index;
      const allEnd = allStart + match[0].length; // inklusive ${...}$

      const leftStart = allStart;
      const leftEnd = allStart + OPEN_DELIM.length;
      const rightEnd = allEnd;
      const rightStart = rightEnd - CLOSE_DELIM.length;

      const innerStart = leftEnd;
      const innerEnd = rightStart;

      const innerRange = createRangeFromIndexes(innerStart, innerEnd);
      const leftRange = createRangeFromIndexes(leftStart, leftEnd);
      const rightRange = createRangeFromIndexes(rightStart, rightEnd);

      if (!innerRange || !leftRange || !rightRange) continue;

      targets.push({
        inner: innerRange,
        left: leftRange,
        right: rightRange,
      });
    }

    return targets;
  };

  const highlightCurrentEquation = () => {
    if (!equationTargets.length) return;
    if (equationIndex < 0 || equationIndex >= equationTargets.length) return;
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(equationTargets[equationIndex].inner);
  };

  const deleteDelimitersAndAdvance = () => {
    if (!equationTargets.length) return;
    const current = equationTargets[equationIndex];
    if (!current) return;

    deleteRangeSafely(current.right);
    deleteRangeSafely(current.left);

    const root = currentEditableRoot || getCurrentEditableRoot();
    if (!root) {
      equationTargets = [];
      equationIndex = 0;
      return;
    }

    equationTargets = collectEquationRanges(root);
    if (!equationTargets.length) {
      equationTargets = [];
      equationIndex = 0;
      return;
    }

    if (equationIndex >= equationTargets.length) {
      equationIndex = equationTargets.length - 1;
    }
    highlightCurrentEquation();
  };

  // Nach normalem Paste (Strg/Cmd+V) alle ${...}$ im aktuellen Block einsammeln
  document.addEventListener("paste", () => {
    setTimeout(() => {
      const root = getCurrentEditableRoot();
      if (!root) return;
      currentEditableRoot = root;
      equationTargets = collectEquationRanges(root);
      if (!equationTargets.length) {
        equationTargets = [];
        equationIndex = 0;
        return;
      }
      equationIndex = 0;
      highlightCurrentEquation();
    }, 50);
  });

  // F2: Delimiter der aktuellen Formel löschen und zur nächsten springen
  // Cmd/Ctrl+Shift+E: Notions Equation-Shortcut rendert, danach löschen wir die Delimiter derselben Formel.
  document.addEventListener("keydown", (e) => {
    if (!equationTargets.length) return;

    if (e.key === "F2") {
      e.preventDefault();
      deleteDelimitersAndAdvance();
      return;
    }

    const isCmdOrCtrl = e.metaKey || e.ctrlKey;
    const isShift = e.shiftKey;
    const isE = e.key === "e" || e.key === "E" || e.code === "KeyE";
    if (isCmdOrCtrl && isShift && isE) {
      // Notion soll den Shortcut ganz normal ausführen
      setTimeout(() => {
        deleteDelimitersAndAdvance();
      }, 0);
    }
  });
}