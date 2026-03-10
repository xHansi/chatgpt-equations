export function selectionContainsKatex(selection: Selection | null): boolean {
  if (!selection || selection.rangeCount === 0) return false;
  const range = selection.getRangeAt(0);
  if (range.collapsed) return false;
  const fragment = range.cloneContents();
  return !!(fragment.querySelector && fragment.querySelector(".katex"));
}

