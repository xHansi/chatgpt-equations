/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/content/equationAssistant.ts":
/*!******************************************!*\
  !*** ./src/content/equationAssistant.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "initEquationAssistant": () => (/* binding */ initEquationAssistant)
/* harmony export */ });
/* harmony import */ var _core_mathExtraction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/mathExtraction */ "./src/core/mathExtraction.ts");
/* harmony import */ var _core_clipboard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/clipboard */ "./src/core/clipboard.ts");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
// @ts-nocheck



var EquationAssistant = /*#__PURE__*/function () {
  function EquationAssistant(provider) {
    _classCallCheck(this, EquationAssistant);
    this.provider = provider;
    this.copyButton = null;
    this._timer = null;
    this.setupSelectionListeners();
  }
  _createClass(EquationAssistant, [{
    key: "setupSelectionListeners",
    value: function setupSelectionListeners() {
      var _this = this;
      document.addEventListener("mouseup", function () {
        clearTimeout(_this._timer);
        _this._timer = setTimeout(function () {
          return _this.onSelectionChange();
        }, 80);
      });
      document.addEventListener("selectionchange", function () {
        clearTimeout(_this._timer);
        _this._timer = setTimeout(function () {
          return _this.onSelectionChange();
        }, 100);
      });
    }
  }, {
    key: "onSelectionChange",
    value: function onSelectionChange() {
      var selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        this.hideCopyButton();
        return;
      }
      var extracted = (0,_core_mathExtraction__WEBPACK_IMPORTED_MODULE_0__.extractMath)(this.provider, selection);

      // For non-ChatGPT providers math may not use explicit LaTeX delimiters.
      // In that case we still want to show the button as long as there is a non-empty selection.
      var fallbackText = this.provider === "chatgpt" ? "" : selection.toString();
      var textForButton = extracted && extracted.trim() || fallbackText.trim();
      if (textForButton) {
        this.showCopyButton(selection, textForButton);
      } else {
        this.hideCopyButton();
      }
    }
  }, {
    key: "showCopyButton",
    value: function showCopyButton(selection, textToCopy) {
      var _this2 = this;
      if (this.copyButton && this.copyButton.classList.contains("gpt-eq-copy-for-notion-done")) {
        return;
      }
      if (this.copyButton) {
        this.copyButton.remove();
        this.copyButton = null;
      }
      if (!selection || selection.rangeCount === 0) return;
      var range = selection.getRangeAt(0);
      var rects = range.getClientRects();
      var lastRect = rects.length ? rects[rects.length - 1] : null;
      if (!lastRect) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gpt-eq-copy-for-notion";
      btn.textContent = "Copy for Notion";
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var sel = window.getSelection();

        // Gemini: zuerst normalen Copy-Vorgang triggern und den rohen Clipboard-Text
        // in unser $<...>$-Format umwandeln, damit wir die gleiche Quelle nutzen wie Strg+C.
        if (_this2.provider === "gemini" && typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.readText) {
          try {
            document.execCommand("copy");
          } catch (_unused) {
            // ignore; wir fallen ggf. auf den normalen Pfad zurück
          }
          navigator.clipboard.readText().then(function (raw) {
            var normalized = (0,_core_mathExtraction__WEBPACK_IMPORTED_MODULE_0__.normalizeGeminiClipboardText)(raw);
            var _final = normalized || textToCopy || "";
            if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
              chrome.storage.local.set({
                notionCopyText: _final
              });
            }
            return (0,_core_clipboard__WEBPACK_IMPORTED_MODULE_1__.copyTextToClipboard)(_final);
          }).then(function () {
            btn.textContent = "✓ Copied!";
            btn.classList.add("gpt-eq-copy-for-notion-done");
            setTimeout(function () {
              if (btn.parentNode) btn.remove();
              _this2.copyButton = null;
            }, 1800);
          })["catch"](function () {
            // Fallback auf den generischen Pfad, falls irgendetwas schief geht.
            var fallbackFinal = (0,_core_mathExtraction__WEBPACK_IMPORTED_MODULE_0__.extractMath)(_this2.provider, sel) || textToCopy || "";
            if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
              chrome.storage.local.set({
                notionCopyText: fallbackFinal
              });
            }
            (0,_core_clipboard__WEBPACK_IMPORTED_MODULE_1__.copyTextToClipboard)(fallbackFinal).then(function () {
              btn.textContent = "✓ Copied!";
              btn.classList.add("gpt-eq-copy-for-notion-done");
              setTimeout(function () {
                if (btn.parentNode) btn.remove();
                _this2.copyButton = null;
              }, 1800);
            });
          });
          return;
        }
        var _final2 = (0,_core_mathExtraction__WEBPACK_IMPORTED_MODULE_0__.extractMath)(_this2.provider, sel) || textToCopy || "";
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({
            notionCopyText: _final2
          });
        }
        (0,_core_clipboard__WEBPACK_IMPORTED_MODULE_1__.copyTextToClipboard)(_final2).then(function () {
          btn.textContent = "✓ Copied!";
          btn.classList.add("gpt-eq-copy-for-notion-done");
          setTimeout(function () {
            if (btn.parentNode) btn.remove();
            _this2.copyButton = null;
          }, 1800);
        });
      });
      document.body.appendChild(btn);
      this.copyButton = btn;
      var padding = 8;
      var rect = btn.getBoundingClientRect();
      var top = lastRect.top - rect.height - padding;
      var left = lastRect.left;
      btn.style.top = "".concat(Math.max(4, top), "px");
      btn.style.left = "".concat(left, "px");
    }
  }, {
    key: "hideCopyButton",
    value: function hideCopyButton() {
      if (this.copyButton) {
        this.copyButton.remove();
        this.copyButton = null;
      }
    }
  }]);
  return EquationAssistant;
}();
function initEquationAssistant(provider) {
  new EquationAssistant(provider);
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
  var pickEquationIndexNearCaret = function pickEquationIndexNearCaret() {
    if (!equationTargets.length) return 0;
    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return 0;
    var caretRange = sel.getRangeAt(0);

    // Prefer the first equation whose inner range ends at or after the caret.
    for (var i = 0; i < equationTargets.length; i++) {
      var eqRange = equationTargets[i].inner;
      try {
        var cmp = caretRange.compareBoundaryPoints(Range.START_TO_END, eqRange);
        if (cmp <= 0) {
          return i;
        }
      } catch (_unused) {
        // If compareBoundaryPoints fails for some reason, fall back to the first equation.
        return 0;
      }
    }

    // If caret is after all equations, start at the last one.
    return equationTargets.length - 1;
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
      equationIndex = pickEquationIndexNearCaret();
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
      equationIndex = pickEquationIndexNearCaret();
      highlightCurrentEquation();
    }, 50);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "F2") {
      e.preventDefault();
      // F2: highlight equation near caret, then walk forward with subsequent presses.
      var root = getCurrentEditableRoot();
      if (!root) return;
      currentEditableRoot = root;
      equationTargets = collectRangesForRoot(root);
      if (!equationTargets.length) {
        equationTargets = [];
        equationIndex = 0;
        return;
      }
      equationIndex = pickEquationIndexNearCaret();
      highlightCurrentEquation();
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

/***/ "./src/core/mathExtraction.ts":
/*!************************************!*\
  !*** ./src/core/mathExtraction.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "extractMath": () => (/* binding */ extractMath),
/* harmony export */   "extractMathFromChatGpt": () => (/* binding */ extractMathFromChatGpt),
/* harmony export */   "extractMathFromGeminiSelection": () => (/* binding */ extractMathFromGeminiSelection),
/* harmony export */   "extractMathFromSelectionGeneric": () => (/* binding */ extractMathFromSelectionGeneric),
/* harmony export */   "getExtractionStrategy": () => (/* binding */ getExtractionStrategy),
/* harmony export */   "normalizeGeminiClipboardText": () => (/* binding */ normalizeGeminiClipboardText)
/* harmony export */ });
/* harmony import */ var _notionFormat__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./notionFormat */ "./src/core/notionFormat.ts");
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function getSelectionRoot(selection) {
  if (selection && selection.rangeCount > 0) {
    var range = selection.getRangeAt(0);
    var common = range.commonAncestorContainer;
    if (common.nodeType === Node.ELEMENT_NODE) {
      return common;
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
function wrapDoubleDollarBlocks(text) {
  var indices = [];
  var searchFrom = 0;
  while (true) {
    var idx = text.indexOf("$$", searchFrom);
    if (idx === -1) break;
    indices.push(idx);
    searchFrom = idx + 2;
  }
  if (indices.length < 2) {
    return text;
  }
  var result = "";
  var lastPos = 0;
  for (var i = 0; i + 1 < indices.length; i += 2) {
    var openIdx = indices[i];
    var closeIdx = indices[i + 1];
    result += text.slice(lastPos, openIdx);
    var inner = text.slice(openIdx + 2, closeIdx);
    result += "$<".concat(inner.trim(), ">$");
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
function applyBlockOnlyMathNormalization(text) {
  var out = wrapDoubleDollarBlocks(text);
  out = out.replace(/\\\(([^)]+)\\\)/g, function (_m, expr) {
    return "$<".concat(expr.trim(), ">$");
  });
  out = out.replace(/\\\[([\s\S]*?)\\\]/g, function (_m, expr) {
    return "$<".concat(expr.trim(), ">$");
  });
  return out;
}

/**
 * Generic normalization for non-Gemini providers:
 * - Block $$...$$ via pair logic
 * - Inline $...$ (careful to avoid $$ and already-normalized $<...>$)
 * - \( ... \), \[ ... \]
 */
function applyGenericMathNormalization(text) {
  var out = wrapDoubleDollarBlocks(text);

  // Inline $...$, but not $$...$$ or already $<...>$
  out = out.replace(/(?<!\$)\$((?!<)[^$\n]+?)(?<!>)\$(?!\$)/g, function (_m, expr) {
    return "$<".concat(expr.trim(), ">$");
  });
  out = out.replace(/\\\(([^)]+)\\\)/g, function (_m, expr) {
    return "$<".concat(expr.trim(), ">$");
  });
  out = out.replace(/\\\[([\s\S]*?)\\\]/g, function (_m, expr) {
    return "$<".concat(expr.trim(), ">$");
  });
  return out;
}

/**
 * Heuristik: erkennt Blöcke mit vielen Unicode-Math-Symbolen (DeepSeek-Style),
 * um sie optional in LaTeX zu überführen.
 */
function looksLikeUnicodeMathBlock(text) {
  // Zeichen, die typisch für Unicode-Math-Ausgabe sind (griechisch, Operatoren, Integral, Partial, etc.)
  var unicodeMathPattern = /[∂∫∞≈≠≤≥√±→⋅·╱∑∏ΔΛΩμνπφθλσρΓΨΦ]/;
  // Wenn zu wenig solcher Zeichen vorkommen, behandeln wir es nicht als speziellen Block.
  var hits = 0;
  var _iterator = _createForOfIteratorHelper(text),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var ch = _step.value;
      if (unicodeMathPattern.test(ch)) {
        hits++;
        if (hits >= 3) return true;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return false;
}

/**
 * Heuristik für ASCII-basierte Math-Blöcke (DeepSeek-Style ohne Unicode),
 * z.B. mehrzeilige "x = ..." mit vielen Operatoren, aber ohne lange Wörter.
 */
function looksLikeAsciiMathBlock(text) {
  var trimmed = text.trim();
  if (!trimmed) return false;

  // Enthält mindestens ein Gleichheitszeichen oder +/- Vergleichsoperator.
  if (!/[=±<>]/.test(trimmed)) {
    return false;
  }

  // Wenn es "lange" Wörter gibt, ist es wahrscheinlich eher normaler Text.
  if (/\b[A-Za-z]{5,}\b/.test(trimmed)) {
    return false;
  }

  // Erlaubte Zeichen: Buchstaben, Ziffern, Leerraum und typische Operatoren/Klammern.
  var disallowed = trimmed.replace(/[A-Za-z0-9\s()+\-*/=±^_.,]/g, "");
  if (disallowed.length > 0) {
    return false;
  }
  return true;
}

/**
 * Sehr konservative Unicode-Math → LaTeX Abbildung für DeepSeek-Ausgaben.
 * Wir decken nur häufige Symbole ab; unbekannte Zeichen bleiben unverändert.
 */
function normalizeUnicodeMathToLatex(text) {
  var out = text;
  var simpleMap = [
  // Basic operators / structure
  [/·|⋅/g, "\\cdot "], [/×/g, "\\times "], [/÷/g, "\\div "], [/∓/g, "\\mp "], [/±/g, "\\pm "], [/∑/g, "\\sum "], [/∏/g, "\\prod "], [/∐/g, "\\coprod "], [/∫/g, "\\int "], [/∮/g, "\\oint "], [/∂/g, "\\partial "], [/∇/g, "\\nabla "], [/√/g, "\\sqrt "], [/∞/g, "\\infty "], [/°/g, "^\\circ "], [/′/g, "'"], [/″/g, "''"],
  // Relations / logic
  [/≤/g, "\\le "], [/≥/g, "\\ge "], [/≠/g, "\\ne "], [/≈/g, "\\approx "], [/≃/g, "\\simeq "], [/≅/g, "\\cong "], [/≡/g, "\\equiv "], [/∝/g, "\\propto "], [/∈/g, "\\in "], [/∉/g, "\\notin "], [/⊂/g, "\\subset "], [/⊃/g, "\\supset "], [/⊆/g, "\\subseteq "], [/⊇/g, "\\supseteq "], [/⊄/g, "\\nsubseteq "], [/⊅/g, "\\nsupseteq "], [/∩/g, "\\cap "], [/∪/g, "\\cup "], [/⊎/g, "\\uplus "], [/⊕/g, "\\oplus "], [/⊖/g, "\\ominus "], [/⊗/g, "\\otimes "], [/⊘/g, "\\oslash "], [/⊙/g, "\\odot "], [/⊥/g, "\\perp "], [/∥/g, "\\parallel "], [/¬/g, "\\neg "],
  // Arrows
  [/→/g, "\\to "], [/←/g, "\\leftarrow "], [/⇒/g, "\\Rightarrow "], [/⇐/g, "\\Leftarrow "], [/⇔/g, "\\Leftrightarrow "], [/↦/g, "\\mapsto "],
  // Blackboard bold sets
  [/ℝ/g, "\\mathbb{R}"], [/ℤ/g, "\\mathbb{Z}"], [/ℚ/g, "\\mathbb{Q}"], [/ℂ/g, "\\mathbb{C}"], [/ℕ/g, "\\mathbb{N}"],
  // Other common math symbols
  [/ℏ/g, "\\hbar "], [/∅/g, "\\emptyset "], [/♯/g, "\\sharp "], [/♭/g, "\\flat "],
  // Greek letters (lowercase)
  [/α/g, "\\alpha "], [/β/g, "\\beta "], [/γ/g, "\\gamma "], [/δ/g, "\\delta "], [/ε/g, "\\epsilon "], [/ϵ/g, "\\varepsilon "], [/ζ/g, "\\zeta "], [/η/g, "\\eta "], [/θ/g, "\\theta "], [/ϑ/g, "\\vartheta "], [/ι/g, "\\iota "], [/κ/g, "\\kappa "], [/λ/g, "\\lambda "], [/μ/g, "\\mu "], [/ν/g, "\\nu "], [/ξ/g, "\\xi "], [/π/g, "\\pi "], [/ϖ/g, "\\varpi "], [/ρ/g, "\\rho "], [/ϱ/g, "\\varrho "], [/σ/g, "\\sigma "], [/ς/g, "\\sigma "], [/τ/g, "\\tau "], [/υ/g, "\\upsilon "], [/φ/g, "\\phi "], [/ϕ/g, "\\varphi "], [/χ/g, "\\chi "], [/ψ/g, "\\psi "], [/ω/g, "\\omega "],
  // Greek letters (uppercase)
  [/Γ/g, "\\Gamma "], [/Δ/g, "\\Delta "], [/Θ/g, "\\Theta "], [/Λ/g, "\\Lambda "], [/Ξ/g, "\\Xi "], [/Π/g, "\\Pi "], [/Σ/g, "\\Sigma "], [/Υ/g, "\\Upsilon "], [/Φ/g, "\\Phi "], [/Ψ/g, "\\Psi "], [/Ω/g, "\\Omega "]];
  for (var _i = 0, _simpleMap = simpleMap; _i < _simpleMap.length; _i++) {
    var _simpleMap$_i = _slicedToArray(_simpleMap[_i], 2),
      re = _simpleMap$_i[0],
      replacement = _simpleMap$_i[1];
    out = out.replace(re, replacement);
  }

  // Unicode-Superscript-Digits → ^{n}
  var superscripts = {
    "⁰": "0",
    "¹": "1",
    "²": "2",
    "³": "3",
    "⁴": "4",
    "⁵": "5",
    "⁶": "6",
    "⁷": "7",
    "⁸": "8",
    "⁹": "9"
  };
  out = out.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, function (m) {
    var digits = m.split("").map(function (ch) {
      var _superscripts$ch;
      return (_superscripts$ch = superscripts[ch]) !== null && _superscripts$ch !== void 0 ? _superscripts$ch : "";
    }).join("");
    return digits ? "^{".concat(digits, "}") : m;
  });

  // Unicode-Subscript-Digits → _{n}
  var subscripts = {
    "₀": "0",
    "₁": "1",
    "₂": "2",
    "₃": "3",
    "₄": "4",
    "₅": "5",
    "₆": "6",
    "₇": "7",
    "₈": "8",
    "₉": "9"
  };
  out = out.replace(/[₀₁₂₃₄₅₆₇₈₉]+/g, function (m) {
    var digits = m.split("").map(function (ch) {
      var _subscripts$ch;
      return (_subscripts$ch = subscripts[ch]) !== null && _subscripts$ch !== void 0 ? _subscripts$ch : "";
    }).join("");
    return digits ? "_{".concat(digits, "}") : m;
  });
  return out;
}

/**
 * Gemini-specific extraction:
 * - Only block formulas ( $$...$$ pairs, \(...\), \[...\] )
 * - No inline $...$ conversion so that text with $a$, $b$, $c$ etc. stays intact.
 */
function extractMathFromGeminiSelection(selection) {
  if (!selection || selection.rangeCount === 0) return "";
  var text = selection.toString();
  if (!text.trim()) return "";
  var out = applyBlockOnlyMathNormalization(text);
  if (out === text) return "";
  return out.trim();
}

/**
 * ChatGPT-specific extractor: reuses the existing Notion formatter,
 * which already walks the KaTeX DOM and produces $<...>$ segments.
 */
function extractMathFromChatGpt(selection) {
  return (0,_notionFormat__WEBPACK_IMPORTED_MODULE_0__.getNotionFormatFromSelection)(selection);
}
function getExtractionStrategy(provider) {
  switch (provider) {
    case "chatgpt":
      return function (_root, selection) {
        return extractMathFromChatGpt(selection);
      };
    case "gemini":
      return function (_root, selection) {
        return extractMathFromGeminiSelection(selection);
      };
    case "perplexity":
    case "claude":
    case "generic":
    default:
      return function (_root, selection) {
        return extractMathFromSelectionGeneric(selection);
      };
  }
}
function extractMath(provider, selection) {
  var root = getSelectionRoot(selection);
  var strategy = getExtractionStrategy(provider);
  return strategy(root, selection);
}

/**
 * Used by the Gemini-specific clipboard normalization to turn system clipboard
 * text into the $<...>$ format with the same block-logic as above (no inline $...$).
 */
function normalizeGeminiClipboardText(raw) {
  if (!raw) return "";
  var out = applyBlockOnlyMathNormalization(raw);
  return out.trim();
}

/**
 * Generic text-based math extraction for non-ChatGPT providers:
 * - Versucht zuerst klassische LaTeX-Delimiters zu normalisieren.
 * - Fällt dann auf die Unicode/ASCII-Math-Heuristiken zurück (DeepSeek-Style),
 *   um aus ungewöhnlich formatierten Blöcken einen einzelnen $<...>$-Ausdruck zu bauen.
 */
function extractMathFromSelectionGeneric(selection) {
  if (!selection || selection.rangeCount === 0) return "";
  var rawText = selection.toString();
  if (!rawText.trim()) return "";

  // 1) Direkte LaTeX-Normalisierung auf dem Gesamttext.
  var direct = applyGenericMathNormalization(rawText);
  if (direct !== rawText) {
    return direct.trim();
  }

  // 2) DeepSeek-Style: Text in Absätze teilen und "mathigsten" Block suchen.
  var paragraphs = rawText.split(/\n\s*\n+/);
  var text = rawText;
  var _iterator2 = _createForOfIteratorHelper(paragraphs),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var para = _step2.value;
      var _candidate = para.trim();
      if (!_candidate) continue;
      if (looksLikeUnicodeMathBlock(_candidate) || looksLikeAsciiMathBlock(_candidate)) {
        text = _candidate;
        break;
      }
    }

    // 3) Wenn das nicht reicht: von unten nach oben Zeilen sammeln, bis es mathig aussieht.
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  if (!looksLikeUnicodeMathBlock(text) && !looksLikeAsciiMathBlock(text)) {
    var lines = rawText.split(/\n+/).map(function (l) {
      return l.trim();
    }).filter(Boolean);
    var acc = [];
    for (var i = lines.length - 1; i >= 0; i--) {
      acc.unshift(lines[i]);
      var candidate = acc.join(" ");
      if (looksLikeUnicodeMathBlock(candidate) || looksLikeAsciiMathBlock(candidate)) {
        text = candidate;
        break;
      }
    }
  }

  // 4) Wenn der finale Text immer noch nicht wie Math aussieht, brechen wir ab.
  if (!looksLikeUnicodeMathBlock(text) && !looksLikeAsciiMathBlock(text)) {
    return "";
  }

  // 5) Unicode→LaTeX-Mapping anwenden; falls nichts greift, Whitespace glätten.
  var latex = normalizeUnicodeMathToLatex(text).trim();
  if (!latex) {
    latex = text.replace(/\s+/g, " ").trim();
  }
  if (!latex) return "";
  return "$<".concat(latex, ">$");
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

/***/ "./src/core/providers.ts":
/*!*******************************!*\
  !*** ./src/core/providers.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getProviderForHost": () => (/* binding */ getProviderForHost),
/* harmony export */   "hostMatchesDomain": () => (/* binding */ hostMatchesDomain),
/* harmony export */   "seedDefaultDomains": () => (/* binding */ seedDefaultDomains),
/* harmony export */   "withDefaultProvider": () => (/* binding */ withDefaultProvider)
/* harmony export */ });
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var DEFAULT_PROVIDER_MAP = [{
  domain: "chat.openai.com",
  provider: "chatgpt"
}, {
  domain: "chatgpt.com",
  provider: "chatgpt"
}, {
  domain: "gemini.google.com",
  provider: "gemini"
}, {
  domain: "perplexity.ai",
  provider: "perplexity"
}, {
  domain: "www.perplexity.ai",
  provider: "perplexity"
}, {
  domain: "claude.ai",
  provider: "claude"
}];
function getProviderForHost(host) {
  var direct = DEFAULT_PROVIDER_MAP.find(function (d) {
    return d.domain === host;
  });
  if (direct) return direct.provider;
  // Fallback: generic when we don't know this host.
  return "generic";
}
function hostMatchesDomain(host, domain) {
  if (host === domain) return true;
  return host.endsWith("." + domain);
}
function withDefaultProvider(config) {
  if (config.provider) {
    return config;
  }
  return _objectSpread(_objectSpread({}, config), {}, {
    provider: getProviderForHost(config.domain)
  });
}
function seedDefaultDomains() {
  // Use one canonical entry per domain from DEFAULT_PROVIDER_MAP.
  var seen = new Set();
  var result = [];
  var _iterator = _createForOfIteratorHelper(DEFAULT_PROVIDER_MAP),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _step$value = _step.value,
        domain = _step$value.domain,
        provider = _step$value.provider;
      if (seen.has(domain)) continue;
      seen.add(domain);
      result.push({
        domain: domain,
        enabled: true,
        provider: provider
      });
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return result;
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
/* harmony import */ var _content_notionContent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./content/notionContent */ "./src/content/notionContent.ts");
/* harmony import */ var _content_equationAssistant__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./content/equationAssistant */ "./src/content/equationAssistant.ts");
/* harmony import */ var _core_providers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./core/providers */ "./src/core/providers.ts");
// @ts-nocheck




var isNotionHost = location.host.includes("notion.so") || location.host.includes("notion.site");
var STORAGE_KEY = "equationAssistantDomains";

/**
 * Load domain configuration from chrome.storage.local, falling back to defaults
 * and ensuring each entry has a provider field.
 */
function loadDomainConfig() {
  var DEFAULT_DOMAINS = (0,_core_providers__WEBPACK_IMPORTED_MODULE_2__.seedDefaultDomains)();
  return new Promise(function (resolve) {
    if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) {
      resolve(DEFAULT_DOMAINS);
      return;
    }
    chrome.storage.local.get(STORAGE_KEY, function (data) {
      var rawList = data && data[STORAGE_KEY];
      if (!rawList || !Array.isArray(rawList) || rawList.length === 0) {
        resolve(DEFAULT_DOMAINS);
        return;
      }
      var normalized = rawList.map(function (item) {
        return (0,_core_providers__WEBPACK_IMPORTED_MODULE_2__.withDefaultProvider)({
          domain: item.domain,
          enabled: item.enabled !== false,
          provider: item.provider || (0,_core_providers__WEBPACK_IMPORTED_MODULE_2__.getProviderForHost)(item.domain)
        });
      });
      resolve(normalized);
    });
  });
}
loadDomainConfig().then(function (domains) {
  var host = location.host;
  var entry = domains.find(function (d) {
    return d.enabled && (0,_core_providers__WEBPACK_IMPORTED_MODULE_2__.hostMatchesDomain)(host, d.domain);
  });
  if (entry) {
    (0,_content_equationAssistant__WEBPACK_IMPORTED_MODULE_1__.initEquationAssistant)(entry.provider);
  } else {
    // No explicit entry: fall back to generic provider on known chat-style hosts if desired.
    // For now: do nothing when host is not explicitly enabled.
  }
  if (isNotionHost) {
    (0,_content_notionContent__WEBPACK_IMPORTED_MODULE_0__.initNotionContent)();
  }
});
})();

/******/ })()
;
//# sourceMappingURL=content.js.map