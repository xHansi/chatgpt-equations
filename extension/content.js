/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var NotionCopyGPT = /*#__PURE__*/function () {
  function NotionCopyGPT() {
    _classCallCheck(this, NotionCopyGPT);
    this.setupCopyForNotion();
    this.copyForNotionButton = null;
  }

  /** Returns true if the current selection contains at least one .katex element. */
  _createClass(NotionCopyGPT, [{
    key: "selectionContainsKatex",
    value: function selectionContainsKatex(selection) {
      if (!selection || selection.rangeCount === 0) return false;
      var range = selection.getRangeAt(0);
      if (range.collapsed) return false;
      var fragment = range.cloneContents();
      return fragment.querySelector && fragment.querySelector(".katex");
    }

    /** Decodes HTML entities in LaTeX so the clipboard receives plain text (e.g. &amp; -> &). */
  }, {
    key: "decodeLatexFromAnnotation",
    value: function decodeLatexFromAnnotation(html) {
      if (!html) return "";
      var div = document.createElement("div");
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
  }, {
    key: "getNotionFormatFromFragment",
    value: function getNotionFormatFromFragment(node) {
      var out = "";
      if (!node) return out;
      if (node.nodeType === Node.TEXT_NODE) {
        return (node.textContent || "").replace(/[ \t]+/g, " ");
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        var el = node;

        // KaTeX equation: wrap original LaTeX in ${...}$ for the Notion workflow.
        if (el.classList && el.classList.contains("katex")) {
          var annotation = el.querySelector(".katex-mathml annotation");
          var raw = annotation ? annotation.innerHTML : "";
          var latex = this.decodeLatexFromAnnotation(raw);
          return latex ? '${'.concat(latex, "}$") : "";
        }
        var tag = el.tagName;
        if (tag === "BR") {
          return "\n";
        }
        for (var i = 0; i < el.childNodes.length; i++) {
          out += this.getNotionFormatFromFragment(el.childNodes[i]);
        }
        if (tag === "B" || tag === "STRONG") {
          var inner = out.trim();
          return inner ? "**".concat(inner, "**") : "";
        }
        if (tag === "I" || tag === "EM") {
          var _inner = out.trim();
          return _inner ? "*".concat(_inner, "*") : "";
        }
        if (tag && /^H[1-6]$/.test(tag)) {
          var level = parseInt(tag.substring(1), 10) || 1;
          var hashes = "#".repeat(Math.min(level, 3));
          var _inner2 = out.trim();
          return _inner2 ? "".concat(hashes, " ").concat(_inner2, "\n\n") : "";
        }
        if (tag === "LI") {
          var _inner3 = out.trim();
          return _inner3 ? "- ".concat(_inner3, "\n") : "";
        }
        if (tag === "P" || tag === "DIV" || tag === "SECTION" || tag === "ARTICLE") {
          var _inner4 = out.trim();
          return _inner4 ? "".concat(_inner4, "\n\n") : "";
        }

        // Default: just return concatenated children
        return out;
      }
      if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        for (var _i = 0; _i < node.childNodes.length; _i++) {
          out += this.getNotionFormatFromFragment(node.childNodes[_i]);
        }
      }
      return out;
    }

    /**
     * Builds a single string for Notion from the current selection.
     * Keeps equations as ${latex}$ segments and preserves basic layout
     * (headings, paragraphs, lists).
     */
  }, {
    key: "getNotionFormatFromSelection",
    value: function getNotionFormatFromSelection(selection) {
      if (!selection || selection.rangeCount === 0) return "";
      var range = selection.getRangeAt(0);
      var fragment = range.cloneContents();
      var raw = this.getNotionFormatFromFragment(fragment);
      var normalized = (raw || "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");
      return normalized.trim();
    }

    /**
     * Copies text to the clipboard.
     * Uses the modern Clipboard API when available and falls back to document.execCommand.
     */
  }, {
    key: "copyTextToClipboard",
    value: function copyTextToClipboard(text) {
      if (!text) return Promise.resolve(false);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(function () {
          return true;
        })["catch"](function () {
          return false;
        });
      }
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try {
        ok = document.execCommand("copy");
      } finally {
        ta.remove();
      }
      return Promise.resolve(ok);
    }
  }, {
    key: "showCopyForNotionButton",
    value: function showCopyForNotionButton(selection) {
      var _this = this;
      if (this.copyForNotionButton && this.copyForNotionButton.classList.contains("gpt-eq-copy-for-notion-done")) {
        return;
      }
      if (this.copyForNotionButton) {
        this.copyForNotionButton.remove();
        this.copyForNotionButton = null;
      }
      if (!selection || selection.rangeCount === 0) return;
      var range = selection.getRangeAt(0);
      var rects = range.getClientRects();
      var lastRect = rects.length ? rects[rects.length - 1] : null;
      if (!lastRect) return;
      var textToCopy = this.getNotionFormatFromSelection(selection);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gpt-eq-copy-for-notion";
      btn.textContent = "Copy for Notion";
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var toCopy = textToCopy;
        if (!toCopy) toCopy = _this.getNotionFormatFromSelection(window.getSelection());
        var finalText = toCopy || "";
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({
            notionCopyText: finalText
          });
        }
        _this.copyTextToClipboard(finalText).then(function () {
          btn.textContent = "✓ Copied!";
          btn.classList.add("gpt-eq-copy-for-notion-done");
          setTimeout(function () {
            if (btn.parentNode) btn.remove();
            _this.copyForNotionButton = null;
          }, 1800);
        });
      });
      document.body.appendChild(btn);
      this.copyForNotionButton = btn;
      var padding = 8;
      var rect = btn.getBoundingClientRect();
      var top = lastRect.top - rect.height - padding;
      var left = lastRect.left;
      btn.style.top = "".concat(Math.max(4, top), "px");
      btn.style.left = "".concat(left, "px");
    }
  }, {
    key: "hideCopyForNotionButton",
    value: function hideCopyForNotionButton() {
      if (this.copyForNotionButton) {
        this.copyForNotionButton.remove();
        this.copyForNotionButton = null;
      }
    }
  }, {
    key: "onSelectionChange",
    value: function onSelectionChange() {
      var selection = window.getSelection();
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
  }, {
    key: "setupCopyForNotion",
    value: function setupCopyForNotion() {
      var _this2 = this;
      this._copyForNotionTimer = null;
      document.addEventListener("mouseup", function () {
        clearTimeout(_this2._copyForNotionTimer);
        _this2._copyForNotionTimer = setTimeout(function () {
          return _this2.onSelectionChange();
        }, 80);
      });
      document.addEventListener("selectionchange", function () {
        clearTimeout(_this2._copyForNotionTimer);
        _this2._copyForNotionTimer = setTimeout(function () {
          return _this2.onSelectionChange();
        }, 100);
      });
    }
  }]);
  return NotionCopyGPT;
}();
var isChatGptHost = location.host.includes("chat.openai.com") || location.host.includes("chatgpt.com");
var isNotionHost = location.host.includes("notion.so") || location.host.includes("notion.site");
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
  var equationTargets = [];
  var equationIndex = 0;
  var currentEditableRoot = null;

  // Asymmetrische Delimiter für Formeln: ${ ... }$
  var OPEN_DELIM = "${";
  var CLOSE_DELIM = "}$";
  var EQUATION_REGEX = /\$\{([\s\S]*?)\}\$/g;
  var getCurrentEditableRoot = function getCurrentEditableRoot() {
    var el = document.activeElement;
    while (el && !el.isContentEditable) {
      el = el.parentElement;
    }
    return el || null;
  };
  var deleteRangeSafely = function deleteRangeSafely(range) {
    if (!range) return;
    var startNode = range.startContainer;
    var endNode = range.endContainer;
    var startOffset = range.startOffset;
    var endOffset = range.endOffset;
    if (startNode === endNode && startNode.nodeType === Node.TEXT_NODE && typeof startOffset === "number" && typeof endOffset === "number") {
      var text = startNode.textContent || "";
      var before = text.slice(0, startOffset);
      var after = text.slice(endOffset);
      startNode.textContent = before + after;
      return;
    }
    var sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
    try {
      document.execCommand("delete");
    } catch (_unused) {
      // ignore
    }
    sel.removeAllRanges();
  };

  // Sammelt Ranges für alle ${...}$-Vorkommen, auch wenn sie sich über mehrere
  // Textknoten erstrecken. Für jede Formel werden drei Ranges geliefert:
  // inner (nur Inhalt), left (linkes "${") und right (rechtes "}$").
  var collectEquationRanges = function collectEquationRanges(root) {
    var textNodes = [];
    var offsets = [];
    var totalLength = 0;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while (node = walker.nextNode()) {
      var text = node.textContent || "";
      if (!text.length) continue;
      textNodes.push(node);
      offsets.push(totalLength);
      totalLength += text.length;
    }
    var fullText = textNodes.map(function (n) {
      return n.textContent || "";
    }).join("");
    var targets = [];
    var indexToNodeOffset = function indexToNodeOffset(index) {
      if (!textNodes.length) return {
        node: null,
        offset: 0
      };
      for (var i = 0; i < textNodes.length; i++) {
        var start = offsets[i];
        var end = start + (textNodes[i].textContent || "").length;
        // Halb-offene Intervalle [start, end)
        if (index >= start && index < end) {
          return {
            node: textNodes[i],
            offset: index - start
          };
        }
      }
      // Falls wir genau am Ende landen, auf das Ende des letzten Knotens mappen
      var lastNode = textNodes[textNodes.length - 1];
      return {
        node: lastNode,
        offset: (lastNode.textContent || "").length
      };
    };
    var createRangeFromIndexes = function createRangeFromIndexes(startIndex, endIndex) {
      var startPos = indexToNodeOffset(startIndex);
      var endPos = indexToNodeOffset(endIndex);
      if (!startPos.node || !endPos.node) return null;
      var r = document.createRange();
      r.setStart(startPos.node, startPos.offset);
      r.setEnd(endPos.node, endPos.offset);
      return r;
    };
    EQUATION_REGEX.lastIndex = 0;
    var match;
    while ((match = EQUATION_REGEX.exec(fullText)) !== null) {
      var allStart = match.index;
      var allEnd = allStart + match[0].length; // inklusive ${...}$

      var leftStart = allStart;
      var leftEnd = allStart + OPEN_DELIM.length;
      var rightEnd = allEnd;
      var rightStart = rightEnd - CLOSE_DELIM.length;
      var innerStart = leftEnd;
      var innerEnd = rightStart;
      var innerRange = createRangeFromIndexes(innerStart, innerEnd);
      var leftRange = createRangeFromIndexes(leftStart, leftEnd);
      var rightRange = createRangeFromIndexes(rightStart, rightEnd);
      if (!innerRange || !leftRange || !rightRange) continue;
      targets.push({
        inner: innerRange,
        left: leftRange,
        right: rightRange
      });
    }
    return targets;
  };
  var highlightCurrentEquation = function highlightCurrentEquation() {
    if (!equationTargets.length) return;
    if (equationIndex < 0 || equationIndex >= equationTargets.length) return;
    var sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(equationTargets[equationIndex].inner);
  };
  var deleteDelimitersAndAdvance = function deleteDelimitersAndAdvance() {
    if (!equationTargets.length) return;
    var current = equationTargets[equationIndex];
    if (!current) return;
    deleteRangeSafely(current.right);
    deleteRangeSafely(current.left);
    var root = currentEditableRoot || getCurrentEditableRoot();
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
  document.addEventListener("paste", function () {
    setTimeout(function () {
      var root = getCurrentEditableRoot();
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
  document.addEventListener("keydown", function (e) {
    if (!equationTargets.length) return;
    if (e.key === "F2") {
      e.preventDefault();
      deleteDelimitersAndAdvance();
      return;
    }
    var isCmdOrCtrl = e.metaKey || e.ctrlKey;
    var isShift = e.shiftKey;
    var isE = e.key === "e" || e.key === "E" || e.code === "KeyE";
    if (isCmdOrCtrl && isShift && isE) {
      // Notion soll den Shortcut ganz normal ausführen
      setTimeout(function () {
        deleteDelimitersAndAdvance();
      }, 0);
    }
  });
}
/******/ })()
;
//# sourceMappingURL=content.js.map