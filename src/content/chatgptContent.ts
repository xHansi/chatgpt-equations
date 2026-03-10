// @ts-nocheck

import { selectionContainsKatex } from "../core/selection";
import { getNotionFormatFromSelection } from "../core/notionFormat";
import { copyTextToClipboard } from "../core/clipboard";

class NotionCopyGPT {
  constructor() {
    this.setupCopyForNotion();
    this.copyForNotionButton = null;
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

    let textToCopy = getNotionFormatFromSelection(selection);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gpt-eq-copy-for-notion";
    btn.textContent = "Copy for Notion";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      let toCopy = textToCopy;
      if (!toCopy) toCopy = getNotionFormatFromSelection(window.getSelection());
      const finalText = toCopy || "";

      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ notionCopyText: finalText });
      }

      copyTextToClipboard(finalText).then(() => {
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
    if (selectionContainsKatex(selection)) {
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

export function initChatGptContent(): void {
  new NotionCopyGPT();
}

