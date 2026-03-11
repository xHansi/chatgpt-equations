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
 * Heuristic: detects blocks with many Unicode math symbols (DeepSeek-style),
 * so we can optionally convert them to LaTeX.
 */
function looksLikeUnicodeMathBlock(text: string): boolean {
  // Characters that are typical for Unicode math output (Greek, operators, integrals, partials, etc.)
  const unicodeMathPattern = /[∂∫∞≈≠≤≥√±→⋅·╱∑∏ΔΛΩμνπφθλσρΓΨΦ]/;
  // If there are too few such characters, we do not treat it as a dedicated math block.
  let hits = 0;
  for (const ch of text) {
    if (unicodeMathPattern.test(ch)) {
      hits++;
      if (hits >= 3) return true;
    }
  }
  return false;
}

/**
 * Heuristic for ASCII-based math blocks (DeepSeek-style without Unicode),
 * e.g. multi-line "x = ..." with many operators but without long words.
 */
function looksLikeAsciiMathBlock(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  // Must contain at least one equality or +/- / comparison operator.
  if (!/[=±<>]/.test(trimmed)) {
    return false;
  }

  // If there are "long" words, it is probably regular prose, not a pure math block.
  if (/\b[A-Za-z]{5,}\b/.test(trimmed)) {
    return false;
  }

  // Allowed characters: letters, digits, whitespace and common operators/brackets.
  const disallowed = trimmed.replace(/[A-Za-z0-9\s()+\-*/=±^_.,]/g, "");
  if (disallowed.length > 0) {
    return false;
  }

  return true;
}

/**
 * Conservative Unicode-math → LaTeX mapping for DeepSeek-style output.
 * We only cover common symbols; unknown characters are left unchanged.
 */
function normalizeUnicodeMathToLatex(text: string): string {
  let out = text;

  const simpleMap: Array<[RegExp, string]> = [
    // Basic operators / structure
    [/·|⋅/g, "\\cdot "],
    [/×/g, "\\times "],
    [/÷/g, "\\div "],
    [/∓/g, "\\mp "],
    [/±/g, "\\pm "],
    [/∑/g, "\\sum "],
    [/∏/g, "\\prod "],
    [/∐/g, "\\coprod "],
    [/∫/g, "\\int "],
    [/∮/g, "\\oint "],
    [/∂/g, "\\partial "],
    [/∇/g, "\\nabla "],
    [/√/g, "\\sqrt "],
    [/∞/g, "\\infty "],
    [/°/g, "^\\circ "],
    [/′/g, "'"],
    [/″/g, "''"],

    // Relations / logic
    [/≤/g, "\\le "],
    [/≥/g, "\\ge "],
    [/≠/g, "\\ne "],
    [/≈/g, "\\approx "],
    [/≃/g, "\\simeq "],
    [/≅/g, "\\cong "],
    [/≡/g, "\\equiv "],
    [/∝/g, "\\propto "],
    [/∈/g, "\\in "],
    [/∉/g, "\\notin "],
    [/⊂/g, "\\subset "],
    [/⊃/g, "\\supset "],
    [/⊆/g, "\\subseteq "],
    [/⊇/g, "\\supseteq "],
    [/⊄/g, "\\nsubseteq "],
    [/⊅/g, "\\nsupseteq "],
    [/∩/g, "\\cap "],
    [/∪/g, "\\cup "],
    [/⊎/g, "\\uplus "],
    [/⊕/g, "\\oplus "],
    [/⊖/g, "\\ominus "],
    [/⊗/g, "\\otimes "],
    [/⊘/g, "\\oslash "],
    [/⊙/g, "\\odot "],
    [/⊥/g, "\\perp "],
    [/∥/g, "\\parallel "],
    [/¬/g, "\\neg "],

    // Arrows
    [/→/g, "\\to "],
    [/←/g, "\\leftarrow "],
    [/⇒/g, "\\Rightarrow "],
    [/⇐/g, "\\Leftarrow "],
    [/⇔/g, "\\Leftrightarrow "],
    [/↦/g, "\\mapsto "],

    // Blackboard bold sets
    [/ℝ/g, "\\mathbb{R}"],
    [/ℤ/g, "\\mathbb{Z}"],
    [/ℚ/g, "\\mathbb{Q}"],
    [/ℂ/g, "\\mathbb{C}"],
    [/ℕ/g, "\\mathbb{N}"],

    // Other common math symbols
    [/ℏ/g, "\\hbar "],
    [/∅/g, "\\emptyset "],
    [/♯/g, "\\sharp "],
    [/♭/g, "\\flat "],

    // Greek letters (lowercase)
    [/α/g, "\\alpha "],
    [/β/g, "\\beta "],
    [/γ/g, "\\gamma "],
    [/δ/g, "\\delta "],
    [/ε/g, "\\epsilon "],
    [/ϵ/g, "\\varepsilon "],
    [/ζ/g, "\\zeta "],
    [/η/g, "\\eta "],
    [/θ/g, "\\theta "],
    [/ϑ/g, "\\vartheta "],
    [/ι/g, "\\iota "],
    [/κ/g, "\\kappa "],
    [/λ/g, "\\lambda "],
    [/μ/g, "\\mu "],
    [/ν/g, "\\nu "],
    [/ξ/g, "\\xi "],
    [/π/g, "\\pi "],
    [/ϖ/g, "\\varpi "],
    [/ρ/g, "\\rho "],
    [/ϱ/g, "\\varrho "],
    [/σ/g, "\\sigma "],
    [/ς/g, "\\sigma "],
    [/τ/g, "\\tau "],
    [/υ/g, "\\upsilon "],
    [/φ/g, "\\phi "],
    [/ϕ/g, "\\varphi "],
    [/χ/g, "\\chi "],
    [/ψ/g, "\\psi "],
    [/ω/g, "\\omega "],
    // Greek letters (uppercase)
    [/Γ/g, "\\Gamma "],
    [/Δ/g, "\\Delta "],
    [/Θ/g, "\\Theta "],
    [/Λ/g, "\\Lambda "],
    [/Ξ/g, "\\Xi "],
    [/Π/g, "\\Pi "],
    [/Σ/g, "\\Sigma "],
    [/Υ/g, "\\Upsilon "],
    [/Φ/g, "\\Phi "],
    [/Ψ/g, "\\Psi "],
    [/Ω/g, "\\Omega "],
  ];

  for (const [re, replacement] of simpleMap) {
    out = out.replace(re, replacement);
  }

  // Unicode-Superscript-Digits → ^{n}
  const superscripts: Record<string, string> = {
    "⁰": "0",
    "¹": "1",
    "²": "2",
    "³": "3",
    "⁴": "4",
    "⁵": "5",
    "⁶": "6",
    "⁷": "7",
    "⁸": "8",
    "⁹": "9",
  };
  out = out.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => {
    const digits = m
      .split("")
      .map((ch) => superscripts[ch] ?? "")
      .join("");
    return digits ? `^{${digits}}` : m;
  });

  // Unicode-Subscript-Digits → _{n}
  const subscripts: Record<string, string> = {
    "₀": "0",
    "₁": "1",
    "₂": "2",
    "₃": "3",
    "₄": "4",
    "₅": "5",
    "₆": "6",
    "₇": "7",
    "₈": "8",
    "₉": "9",
  };
  out = out.replace(/[₀₁₂₃₄₅₆₇₈₉]+/g, (m) => {
    const digits = m
      .split("")
      .map((ch) => subscripts[ch] ?? "")
      .join("");
    return digits ? `_{${digits}}` : m;
  });

  return out;
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

/**
 * Claude-specific extractor:
 * - Prefer LaTeX-like lines (containing '\' etc.) and turn each into $<...>$.
 * - If nothing LaTeX-like is found, fall back to the generic extractor.
 */
export function extractMathFromClaudeSelection(selection: Selection | null): string {
  // For now Claude uses the same DOM-based extraction as ChatGPT.
  return extractMathFromChatGpt(selection);
}

export function getExtractionStrategy(provider: ProviderId): MathExtractionStrategy {
  switch (provider) {
    case "chatgpt":
      return (_root, selection) => extractMathFromChatGpt(selection);
    case "gemini":
      return (_root, selection) => extractMathFromGeminiSelection(selection);
    case "claude":
      return (_root, selection) => extractMathFromClaudeSelection(selection);
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

/**
 * Generic text-based math extraction for non-ChatGPT providers:
 * - First tries to normalize standard LaTeX delimiters.
 * - Then falls back to Unicode/ASCII-math heuristics (DeepSeek-style)
 *   to turn unusually formatted blocks into a single $<...>$ expression.
 */
export function extractMathFromSelectionGeneric(selection: Selection | null): string {
  if (!selection || selection.rangeCount === 0) return "";
  const rawText = selection.toString();
  if (!rawText.trim()) return "";

  // 1) Direct LaTeX normalization on the full text.
  const direct = applyGenericMathNormalization(rawText);
  if (direct !== rawText) {
    return direct.trim();
  }

  // 2) DeepSeek-style: split text into paragraphs and look for the "most mathy" block.
  const paragraphs = rawText.split(/\n\s*\n+/);
  let text = rawText;
  for (const para of paragraphs) {
    const candidate = para.trim();
    if (!candidate) continue;
    if (looksLikeUnicodeMathBlock(candidate) || looksLikeAsciiMathBlock(candidate)) {
      text = candidate;
      break;
    }
  }

  // 3) If that is not enough: collect lines from bottom to top until it looks like math.
  if (!looksLikeUnicodeMathBlock(text) && !looksLikeAsciiMathBlock(text)) {
    const lines = rawText
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);

    let acc: string[] = [];
    for (let i = lines.length - 1; i >= 0; i--) {
      acc.unshift(lines[i]);
      const candidate = acc.join(" ");
      if (looksLikeUnicodeMathBlock(candidate) || looksLikeAsciiMathBlock(candidate)) {
        text = candidate;
        break;
      }
    }
  }

  // 4) If the final text still does not look like math, abort.
  if (!looksLikeUnicodeMathBlock(text) && !looksLikeAsciiMathBlock(text)) {
    return "";
  }

  // 5) Apply Unicode→LaTeX mapping; if nothing triggers, at least normalize whitespace.
  let latex = normalizeUnicodeMathToLatex(text).trim();
  if (!latex) {
    latex = text.replace(/\s+/g, " ").trim();
  }

  if (!latex) return "";
  return `$<${latex}>$`;
}

