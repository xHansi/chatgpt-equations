// @ts-nocheck

import { extractMath, normalizeGeminiClipboardText } from "../core/mathExtraction";
import { copyTextToClipboard } from "../core/clipboard";
import type { ProviderId } from "../core/providers";
import { type SupportedLanguage, loadLanguage, getDefaultLanguage, t } from "../core/i18n";

class EquationAssistant {
  provider: ProviderId;
  copyButton: HTMLButtonElement | null;
  _timer: any;
  language: SupportedLanguage;

  constructor(provider: ProviderId) {
    this.provider = provider;
    this.copyButton = null;
    this._timer = null;
    this.language = getDefaultLanguage();
    loadLanguage().then((lang) => {
      this.language = lang;
    });
    this.setupSelectionListeners();
  }

  setupSelectionListeners() {
    document.addEventListener("mouseup", () => {
      clearTimeout(this._timer);
      this._timer = setTimeout(() => this.onSelectionChange(), 80);
    });
    document.addEventListener("selectionchange", () => {
      clearTimeout(this._timer);
      this._timer = setTimeout(() => this.onSelectionChange(), 100);
    });
  }

  onSelectionChange() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      this.hideCopyButton();
      return;
    }

    const extracted = extractMath(this.provider, selection);

    // For non-ChatGPT providers math may not use explicit LaTeX delimiters.
    // In that case we still want to show the button as long as there is a non-empty selection.
    const fallbackText =
      this.provider === "chatgpt" ? "" : selection.toString();

    const textForButton = (extracted && extracted.trim()) || fallbackText.trim();

    if (textForButton) {
      this.showCopyButton(selection, textForButton);
    } else {
      this.hideCopyButton();
    }
  }

  showCopyButton(selection: Selection, textToCopy: string) {
    if (this.copyButton && this.copyButton.classList.contains("gpt-eq-copy-for-notion-done")) {
      return;
    }
    if (this.copyButton) {
      this.copyButton.remove();
      this.copyButton = null;
    }
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const rects = range.getClientRects();
    const lastRect = rects.length ? rects[rects.length - 1] : null;
    if (!lastRect) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gpt-eq-copy-for-notion";
    btn.textContent = t("copyButton", this.language);
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const sel = window.getSelection();

      // Gemini: first trigger a normal copy and then read the raw clipboard text,
      // converting it into our $<...>$ format so we share the same source as Ctrl/Cmd+C.
      if (
        this.provider === "gemini" &&
        typeof navigator !== "undefined" &&
        (navigator as any).clipboard &&
        (navigator as any).clipboard.readText
      ) {
        try {
          document.execCommand("copy");
        } catch {
          // ignore; we will fall back to the generic path if needed
        }

        (navigator as any).clipboard
          .readText()
          .then((raw: string) => {
            const normalized = normalizeGeminiClipboardText(raw);
            const final = normalized || textToCopy || "";

            if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
              chrome.storage.local.set({ notionCopyText: final });
            }

            return copyTextToClipboard(final);
          })
          .then(() => {
            btn.textContent = t("copySuccess", this.language);
            btn.classList.add("gpt-eq-copy-for-notion-done");
            setTimeout(() => {
              if (btn.parentNode) btn.remove();
              this.copyButton = null;
            }, 1800);
          })
          .catch(() => {
            // Fall back to the generic extraction path if anything goes wrong.
            const fallbackFinal = extractMath(this.provider, sel) || textToCopy || "";
            if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
              chrome.storage.local.set({ notionCopyText: fallbackFinal });
            }
            copyTextToClipboard(fallbackFinal).then(() => {
              btn.textContent = t("copySuccess", this.language);
              btn.classList.add("gpt-eq-copy-for-notion-done");
              setTimeout(() => {
                if (btn.parentNode) btn.remove();
                this.copyButton = null;
              }, 1800);
            });
          });

        return;
      }

      const final = extractMath(this.provider, sel) || textToCopy || "";

      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ notionCopyText: final });
      }

      copyTextToClipboard(final).then(() => {
        btn.textContent = t("copySuccess", this.language);
        btn.classList.add("gpt-eq-copy-for-notion-done");
        setTimeout(() => {
          if (btn.parentNode) btn.remove();
          this.copyButton = null;
        }, 1800);
      });
    });
    document.body.appendChild(btn);
    this.copyButton = btn;

    const padding = 8;
    const rect = btn.getBoundingClientRect();
    const top = lastRect.top - rect.height - padding;
    const left = lastRect.left;
    btn.style.top = `${Math.max(4, top)}px`;
    btn.style.left = `${left}px`;
  }

  hideCopyButton() {
    if (this.copyButton) {
      this.copyButton.remove();
      this.copyButton = null;
    }
  }
}

export function initEquationAssistant(provider: ProviderId): void {
  new EquationAssistant(provider);
}

