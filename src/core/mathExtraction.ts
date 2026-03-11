import { getNotionFormatFromSelection } from "./notionFormat";
import type { ProviderId } from "./providers";

export type MathExtractionStrategy = (
  root: Document | HTMLElement | DocumentFragment,
  selection: Selection | null
) => string;

function getSelectionRoot(selection: Selection | null): Document | HTMLElement {
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const common = range.commonAncestorContainer;
    if (common.nodeType === Node.ELEMENT_NODE) {
      return common as HTMLElement;
    }
    if (common.parentElement) {
      return common.parentElement;
    }
  }
  return document;
}

/**
 * Wraps all well-formed $$...$$ block pairs with $<...>$ while leaving
 * surrounding plain text completely untouched.
 *
 * - Scans sequentially for "$$" and forms pairs (open, close)
 * - Ignores a trailing unmatched "$$"
 */
function wrapDoubleDollarBlocks(text: string): string {
  const indices: number[] = [];
  let searchFrom = 0;

  while (true) {
    const idx = text.indexOf("$$", searchFrom);
    if (idx === -1) break;
    indices.push(idx);
    searchFrom = idx + 2;
  }

  if (indices.length < 2) {
    return text;
  }

  let result = "";
  let lastPos = 0;

  for (let i = 0; i + 1 < indices.length; i += 2) {
    const openIdx = indices[i];
    const closeIdx = indices[i + 1];

    result += text.slice(lastPos, openIdx);

    const inner = text.slice(openIdx + 2, closeIdx);
    result += `$<${inner.trim()}>$`;

    lastPos = closeIdx + 2;
  }

  result += text.slice(lastPos);
  return result;
}

/**
 * Block-only normalization:
 * - $$...$$ pairs
 * - \( ... \) and \[ ... \]
 * No inline $...$ handling.
 */
function applyBlockOnlyMathNormalization(text: string): string {
  let out = wrapDoubleDollarBlocks(text);

  out = out.replace(/\\\(([^)]+)\\\)/g, (_m, expr) => `$<${expr.trim()}>$`);
  out = out.replace(/\\\[([\s\S]*?)\\\]/g, (_m, expr) => `$<${expr.trim()}>$`);

  return out;
}

/**
 * Generic normalization for non-Gemini providers:
 * - Block $$...$$ via pair logic
 * - Inline $...$ (careful to avoid $$ and already-normalized $<...>$)
 * - \( ... \), \[ ... \]
 */
function applyGenericMathNormalization(text: string): string {
  let out = wrapDoubleDollarBlocks(text);

  // Inline $...$, but not $$...$$ or already $<...>$
  out = out.replace(
    /(?<!\$)\$((?!<)[^$\n]+?)(?<!>)\$(?!\$)/g,
    (_m, expr) => `$<${expr.trim()}>$`
  );

  out = out.replace(/\\\(([^)]+)\\\)/g, (_m, expr) => `$<${expr.trim()}>$`);
  out = out.replace(/\\\[([\s\S]*?)\\\]/g, (_m, expr) => `$<${expr.trim()}>$`);

  return out;
}

/**
 * Generic text-based math extraction for non-ChatGPT providers:
 * Uses the generic normalization including inline $...$.
 */
export function extractMathFromSelectionGeneric(selection: Selection | null): string {
  if (!selection || selection.rangeCount === 0) return "";
  const text = selection.toString();
  if (!text.trim()) return "";

  const out = applyGenericMathNormalization(text);

  if (out === text) return "";
  return out.trim();
}

/**
 * Gemini-specific extraction:
 * - Only block formulas ( $$...$$ pairs, \(...\), \[...\] )
 * - No inline $...$ conversion so that text with $a$, $b$, $c$ etc. stays intact.
 */
export function extractMathFromGeminiSelection(selection: Selection | null): string {
  if (!selection || selection.rangeCount === 0) return "";
  const text = selection.toString();
  if (!text.trim()) return "";

  const out = applyBlockOnlyMathNormalization(text);

  if (out === text) return "";
  return out.trim();
}

/**
 * ChatGPT-specific extractor: reuses the existing Notion formatter,
 * which already walks the KaTeX DOM and produces $<...>$ segments.
 */
export function extractMathFromChatGpt(selection: Selection | null): string {
  return getNotionFormatFromSelection(selection);
}

export function getExtractionStrategy(provider: ProviderId): MathExtractionStrategy {
  switch (provider) {
    case "chatgpt":
      return (_root, selection) => extractMathFromChatGpt(selection);
    case "gemini":
      return (_root, selection) => extractMathFromGeminiSelection(selection);
    case "perplexity":
    case "claude":
    case "generic":
    default:
      return (_root, selection) => extractMathFromSelectionGeneric(selection);
  }
}

export function extractMath(provider: ProviderId, selection: Selection | null): string {
  const root = getSelectionRoot(selection);
  const strategy = getExtractionStrategy(provider);
  return strategy(root, selection);
}

/**
 * Used by the Gemini-specific clipboard normalization to turn system clipboard
 * text into the $<...>$ format with the same block-logic as above (no inline $...$).
 */
export function normalizeGeminiClipboardText(raw: string): string {
  if (!raw) return "";
  const out = applyBlockOnlyMathNormalization(raw);
  return out.trim();
}

