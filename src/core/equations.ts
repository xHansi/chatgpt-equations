export interface EquationTarget {
  inner: Range;
  left: Range;
  right: Range;
}

// Asymmetric delimiters for equations: $< ... >$
const OPEN_DELIM = "$<";
const CLOSE_DELIM = ">$";

export const EQUATION_OPEN_DELIM = OPEN_DELIM;
export const EQUATION_CLOSE_DELIM = CLOSE_DELIM;

export function deleteRangeSafely(range: Range | null): void {
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
}

/**
 * Collects ranges for all $<...>$ occurrences in document order, even when they
 * span multiple text nodes.
 * For each equation three ranges are returned:
 * - inner: only the LaTeX content
 * - left: the opening "$<"
 * - right: the closing ">$"
 *
 * Delimiter pairing is done with a small deterministic scanner instead of regex:
 * "$<" pushes onto a stack, ">$" closes the most recent open delimiter.
 */
export function collectEquationRanges(root: HTMLElement | Node): EquationTarget[] {
  const textNodes: Text[] = [];
  const offsets: number[] = [];
  let totalLength = 0;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  // eslint-disable-next-line no-cond-assign
  while ((node = walker.nextNode())) {
    const text = node.textContent || "";
    if (!text.length) continue;
    textNodes.push(node as Text);
    offsets.push(totalLength);
    totalLength += text.length;
  }

  const fullText = textNodes.map((n) => n.textContent || "").join("");
  const targets: EquationTarget[] = [];

  const indexToNodeOffset = (index: number): { node: Text | null; offset: number } => {
    if (!textNodes.length) return { node: null, offset: 0 };
    for (let i = 0; i < textNodes.length; i++) {
      const start = offsets[i];
      const end = start + (textNodes[i].textContent || "").length;
      // Half-open intervals [start, end)
      if (index >= start && index < end) {
        return { node: textNodes[i], offset: index - start };
      }
    }
    const lastNode = textNodes[textNodes.length - 1];
    return { node: lastNode, offset: (lastNode.textContent || "").length };
  };

  const createRangeFromIndexes = (startIndex: number, endIndex: number): Range | null => {
    const startPos = indexToNodeOffset(startIndex);
    const endPos = indexToNodeOffset(endIndex);
    if (!startPos.node || !endPos.node) return null;
    const r = document.createRange();
    r.setStart(startPos.node, startPos.offset);
    r.setEnd(endPos.node, endPos.offset);
    return r;
  };

  const openStack: number[] = [];
  const pairs: { startIndex: number; endIndex: number }[] = [];
  for (let i = 0; i < fullText.length - 1; i++) {
    const two = fullText[i] + fullText[i + 1];
    if (two === OPEN_DELIM) {
      openStack.push(i);
      i += 1; // skip second char of OPEN_DELIM
    } else if (two === CLOSE_DELIM && openStack.length) {
      const startIndex = openStack.pop() as number;
      const endIndex = i + CLOSE_DELIM.length;
      pairs.push({ startIndex, endIndex });
      i += 1; // skip second char of CLOSE_DELIM
    }
  }

  for (const { startIndex, endIndex } of pairs) {
    const leftStart = startIndex;
    const leftEnd = startIndex + OPEN_DELIM.length;
    const rightEnd = endIndex;
    const rightStart = rightEnd - CLOSE_DELIM.length;

    const innerStart = leftEnd;
    const innerEnd = rightStart;

    const innerRange = createRangeFromIndexes(innerStart, innerEnd);
    const leftRange = createRangeFromIndexes(leftStart, leftEnd);
    const rightRange = createRangeFromIndexes(rightStart, rightEnd);

    if (!innerRange || !leftRange || !rightRange) {
      continue;
    }

    targets.push({
      inner: innerRange,
      left: leftRange,
      right: rightRange,
    });
  }

  return targets;
}

