// @ts-nocheck

import { collectEquationRanges, deleteRangeSafely } from "../core/equations";

export function initNotionContent(): void {
  let equationTargets = [];
  let equationIndex = 0;
  let currentEditableRoot = null;

  const getCurrentEditableRoot = () => {
    let el = document.activeElement;
    while (el && !el.isContentEditable) {
      el = el.parentElement;
    }
    return el || null;
  };

  const collectRangesForRoot = (root) => collectEquationRanges(root);

  const highlightCurrentEquation = () => {
    if (!equationTargets.length) return;
    if (equationIndex < 0 || equationIndex >= equationTargets.length) return;
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(equationTargets[equationIndex].inner);
  };

  const highlightNextEquation = () => {
    if (!equationTargets.length) return;

    // Move to next equation (cyclic)
    if (equationIndex < equationTargets.length - 1) {
      equationIndex += 1;
    } else {
      equationIndex = 0;
    }
    highlightCurrentEquation();
  };

  const deleteDelimitersAndAdvance = () => {
    if (!equationTargets.length) {
      const root = getCurrentEditableRoot();
      if (!root) return;
      currentEditableRoot = root;
      equationTargets = collectRangesForRoot(root);
      equationIndex = 0;
    }

    if (!equationTargets.length) {
      equationTargets = [];
      equationIndex = 0;
      return;
    }

    if (equationIndex < 0 || equationIndex >= equationTargets.length) {
      equationIndex = 0;
    }

    const current = equationTargets[equationIndex];
    if (!current) return;

    // Remove delimiters of the current equation from the plain text.
    deleteRangeSafely(current.right);
    deleteRangeSafely(current.left);

    const root = currentEditableRoot || getCurrentEditableRoot();
    if (!root) {
      equationTargets = [];
      equationIndex = 0;
      return;
    }

    equationTargets = collectRangesForRoot(root);
    if (!equationTargets.length) {
      equationTargets = [];
      equationIndex = 0;
      return;
    }

    if (equationIndex >= equationTargets.length) {
      equationIndex = equationTargets.length - 1;
    }
    highlightNextEquation();
  };

  // After a normal paste (Cmd/Ctrl+V), collect all ${...}$ segments in the current block.
  document.addEventListener("paste", () => {
    setTimeout(() => {
      const root = getCurrentEditableRoot();
      if (!root) return;
      currentEditableRoot = root;
      equationTargets = collectRangesForRoot(root);
      if (!equationTargets.length) {
        equationTargets = [];
        equationIndex = 0;
        return;
      }
      equationIndex = 0;
      highlightCurrentEquation();
    }, 50);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "F2") {
      e.preventDefault();
      // F2: only highlight and walk through equations, do not delete delimiters.
      if (!equationTargets.length) {
        const root = getCurrentEditableRoot();
        if (!root) return;
        currentEditableRoot = root;
        equationTargets = collectRangesForRoot(root);
        equationIndex = 0;
      }
      if (!equationTargets.length) return;
      highlightNextEquation();
    }

    if (e.key === "F3") {
      e.preventDefault();
      // F3: delete delimiters of current equation and advance.
      deleteDelimitersAndAdvance();
    }
  });
}

