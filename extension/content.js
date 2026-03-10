/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/content/chatgptContent.ts":
/*!***************************************!*\
  !*** ./src/content/chatgptContent.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "initChatGptContent": () => (/* binding */ initChatGptContent)
/* harmony export */ });
/* harmony import */ var _core_selection__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/selection */ "./src/core/selection.ts");
/* harmony import */ var _core_notionFormat__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/notionFormat */ "./src/core/notionFormat.ts");
/* harmony import */ var _core_clipboard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/clipboard */ "./src/core/clipboard.ts");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
// @ts-nocheck




var NotionCopyGPT = /*#__PURE__*/function () {
  function NotionCopyGPT() {
    _classCallCheck(this, NotionCopyGPT);
    this.setupCopyForNotion();
    this.copyForNotionButton = null;
  }
  _createClass(NotionCopyGPT, [{
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
      var textToCopy = (0,_core_notionFormat__WEBPACK_IMPORTED_MODULE_1__.getNotionFormatFromSelection)(selection);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gpt-eq-copy-for-notion";
      btn.textContent = "Copy for Notion";
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var toCopy = textToCopy;
        if (!toCopy) toCopy = (0,_core_notionFormat__WEBPACK_IMPORTED_MODULE_1__.getNotionFormatFromSelection)(window.getSelection());
        var finalText = toCopy || "";
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({
            notionCopyText: finalText
          });
        }
        (0,_core_clipboard__WEBPACK_IMPORTED_MODULE_2__.copyTextToClipboard)(finalText).then(function () {
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
      if ((0,_core_selection__WEBPACK_IMPORTED_MODULE_0__.selectionContainsKatex)(selection)) {
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
function initChatGptContent() {
  new NotionCopyGPT();
}

/***/ }),

/***/ "./src/content/notionContent.ts":
/*!**************************************!*\
  !*** ./src/content/notionContent.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "initNotionContent": () => (/* binding */ initNotionContent)
/* harmony export */ });
/* harmony import */ var _core_equations__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/equations */ "./src/core/equations.ts");
// @ts-nocheck


function initNotionContent() {
  var equationTargets = [];
  var equationIndex = 0;
  var currentEditableRoot = null;
  var getCurrentEditableRoot = function getCurrentEditableRoot() {
    var el = document.activeElement;
    while (el && !el.isContentEditable) {
      el = el.parentElement;
    }
    return el || null;
  };
  var collectRangesForRoot = function collectRangesForRoot(root) {
    return (0,_core_equations__WEBPACK_IMPORTED_MODULE_0__.collectEquationRanges)(root);
  };
  var highlightCurrentEquation = function highlightCurrentEquation() {
    if (!equationTargets.length) return;
    if (equationIndex < 0 || equationIndex >= equationTargets.length) return;
    var sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(equationTargets[equationIndex].inner);
  };
  var highlightNextEquation = function highlightNextEquation() {
    if (!equationTargets.length) return;

    // Move to next equation (cyclic)
    if (equationIndex < equationTargets.length - 1) {
      equationIndex += 1;
    } else {
      equationIndex = 0;
    }
    highlightCurrentEquation();
  };
  var deleteDelimitersAndAdvance = function deleteDelimitersAndAdvance() {
    if (!equationTargets.length) {
      var _root = getCurrentEditableRoot();
      if (!_root) return;
      currentEditableRoot = _root;
      equationTargets = collectRangesForRoot(_root);
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
    var current = equationTargets[equationIndex];
    if (!current) return;

    // Remove delimiters of the current equation from the plain text.
    (0,_core_equations__WEBPACK_IMPORTED_MODULE_0__.deleteRangeSafely)(current.right);
    (0,_core_equations__WEBPACK_IMPORTED_MODULE_0__.deleteRangeSafely)(current.left);
    var root = currentEditableRoot || getCurrentEditableRoot();
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
  document.addEventListener("paste", function () {
    setTimeout(function () {
      var root = getCurrentEditableRoot();
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
  document.addEventListener("keydown", function (e) {
    if (e.key === "F2") {
      e.preventDefault();
      // F2: only highlight and walk through equations, do not delete delimiters.
      if (!equationTargets.length) {
        var root = getCurrentEditableRoot();
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

/***/ }),

/***/ "./src/core/clipboard.ts":
/*!*******************************!*\
  !*** ./src/core/clipboard.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "copyTextToClipboard": () => (/* binding */ copyTextToClipboard)
/* harmony export */ });
function copyTextToClipboard(text) {
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

/***/ }),

/***/ "./src/core/equations.ts":
/*!*******************************!*\
  !*** ./src/core/equations.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EQUATION_CLOSE_DELIM": () => (/* binding */ EQUATION_CLOSE_DELIM),
/* harmony export */   "EQUATION_OPEN_DELIM": () => (/* binding */ EQUATION_OPEN_DELIM),
/* harmony export */   "collectEquationRanges": () => (/* binding */ collectEquationRanges),
/* harmony export */   "deleteRangeSafely": () => (/* binding */ deleteRangeSafely)
/* harmony export */ });
// Asymmetric delimiters for equations: $< ... >$
var OPEN_DELIM = "$<";
var CLOSE_DELIM = ">$";
var EQUATION_OPEN_DELIM = OPEN_DELIM;
var EQUATION_CLOSE_DELIM = CLOSE_DELIM;
function deleteRangeSafely(range) {
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
function collectEquationRanges(root) {
  var textNodes = [];
  var offsets = [];
  var totalLength = 0;
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  var node;
  // eslint-disable-next-line no-cond-assign
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
      // Half-open intervals [start, end)
      if (index >= start && index < end) {
        return {
          node: textNodes[i],
          offset: index - start
        };
      }
    }
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
  var openStack = [];
  var pairs = [];
  for (var i = 0; i < fullText.length - 1; i++) {
    var two = fullText[i] + fullText[i + 1];
    if (two === OPEN_DELIM) {
      openStack.push(i);
      i += 1; // skip second char of OPEN_DELIM
    } else if (two === CLOSE_DELIM && openStack.length) {
      var startIndex = openStack.pop();
      var endIndex = i + CLOSE_DELIM.length;
      pairs.push({
        startIndex: startIndex,
        endIndex: endIndex
      });
      i += 1; // skip second char of CLOSE_DELIM
    }
  }
  for (var _i = 0, _pairs = pairs; _i < _pairs.length; _i++) {
    var _pairs$_i = _pairs[_i],
      _startIndex = _pairs$_i.startIndex,
      _endIndex = _pairs$_i.endIndex;
    var leftStart = _startIndex;
    var leftEnd = _startIndex + OPEN_DELIM.length;
    var rightEnd = _endIndex;
    var rightStart = rightEnd - CLOSE_DELIM.length;
    var innerStart = leftEnd;
    var innerEnd = rightStart;
    var innerRange = createRangeFromIndexes(innerStart, innerEnd);
    var leftRange = createRangeFromIndexes(leftStart, leftEnd);
    var rightRange = createRangeFromIndexes(rightStart, rightEnd);
    if (!innerRange || !leftRange || !rightRange) {
      continue;
    }
    targets.push({
      inner: innerRange,
      left: leftRange,
      right: rightRange
    });
  }
  return targets;
}

/***/ }),

/***/ "./src/core/notionFormat.ts":
/*!**********************************!*\
  !*** ./src/core/notionFormat.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "decodeLatexFromAnnotation": () => (/* binding */ decodeLatexFromAnnotation),
/* harmony export */   "getNotionFormatFromFragment": () => (/* binding */ getNotionFormatFromFragment),
/* harmony export */   "getNotionFormatFromSelection": () => (/* binding */ getNotionFormatFromSelection)
/* harmony export */ });
/**
 * Decodes HTML entities in LaTeX so the clipboard receives plain text (e.g. &amp; -> &).
 */
function decodeLatexFromAnnotation(html) {
  if (!html) return "";
  var div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").trim();
}

/**
 * Walks a fragment/node tree in document order and builds a Notion-friendly string.
 * - Plain text is kept with spaces normalized.
 * - KaTeX equations become $<latex>$.
 * - Basic structure (headings, paragraphs, list items, line breaks) is preserved
 *   using lightweight Markdown-style formatting so Notion keeps the layout.
 */
function getNotionFormatFromFragment(node) {
  var out = "";
  if (!node) return out;
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent || "").replace(/[ \t]+/g, " ");
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    var el = node;

    // KaTeX equation: wrap original LaTeX in $<...>$ for the Notion workflow.
    if (el.classList && el.classList.contains("katex")) {
      var annotation = el.querySelector(".katex-mathml annotation");
      var raw = annotation ? annotation.innerHTML : "";
      var latex = decodeLatexFromAnnotation(raw);
      return latex ? "$<".concat(latex, ">$") : "";
    }
    var tag = el.tagName;
    if (tag === "BR") {
      return "\n";
    }
    for (var i = 0; i < el.childNodes.length; i++) {
      out += getNotionFormatFromFragment(el.childNodes[i]);
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
    var fragment = node;
    for (var _i = 0; _i < fragment.childNodes.length; _i++) {
      out += getNotionFormatFromFragment(fragment.childNodes[_i]);
    }
  }
  return out;
}

/**
 * Builds a single string for Notion from the current selection.
 * Keeps equations as $<latex>$ segments and preserves basic layout
 * (headings, paragraphs, lists).
 */
function getNotionFormatFromSelection(selection) {
  if (!selection || selection.rangeCount === 0) return "";
  var range = selection.getRangeAt(0);
  var fragment = range.cloneContents();
  var raw = getNotionFormatFromFragment(fragment);
  var normalized = (raw || "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");

  // For block equations copied from ChatGPT we want an extra blank line
  // after each standalone $<...>$ line so that Notion creates a separate
  // block. A "standalone" equation is a line whose non-whitespace content
  // consists only of a single $<...>$.
  normalized = normalized.replace(/(^|\n)(\s*\$<[^\n]*>\$\s*)(\n)(?!\n)/g, "$1$2$3\n");
  return normalized.trim();
}

/***/ }),

/***/ "./src/core/selection.ts":
/*!*******************************!*\
  !*** ./src/core/selection.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "selectionContainsKatex": () => (/* binding */ selectionContainsKatex)
/* harmony export */ });
function selectionContainsKatex(selection) {
  if (!selection || selection.rangeCount === 0) return false;
  var range = selection.getRangeAt(0);
  if (range.collapsed) return false;
  var fragment = range.cloneContents();
  return !!(fragment.querySelector && fragment.querySelector(".katex"));
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**************************!*\
  !*** ./src/bootstrap.ts ***!
  \**************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _content_chatgptContent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./content/chatgptContent */ "./src/content/chatgptContent.ts");
/* harmony import */ var _content_notionContent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./content/notionContent */ "./src/content/notionContent.ts");
// @ts-nocheck



var isChatGptHost = location.host.includes("chat.openai.com") || location.host.includes("chatgpt.com");
var isNotionHost = location.host.includes("notion.so") || location.host.includes("notion.site");
if (isChatGptHost) {
  (0,_content_chatgptContent__WEBPACK_IMPORTED_MODULE_0__.initChatGptContent)();
}
if (isNotionHost) {
  (0,_content_notionContent__WEBPACK_IMPORTED_MODULE_1__.initNotionContent)();
}
})();

/******/ })()
;
//# sourceMappingURL=content.js.map