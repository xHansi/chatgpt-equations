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

  /** Returns true if the current selection contains at least one .katex element */
  _createClass(NotionCopyGPT, [{
    key: "selectionContainsKatex",
    value: function selectionContainsKatex(selection) {
      if (!selection || selection.rangeCount === 0) return false;
      var range = selection.getRangeAt(0);
      if (range.collapsed) return false;
      var fragment = range.cloneContents();
      return fragment.querySelector && fragment.querySelector(".katex");
    }

    /** Decode HTML entities in LaTeX so clipboard gets plain text (e.g. &amp; -> &) */
  }, {
    key: "decodeLatexFromAnnotation",
    value: function decodeLatexFromAnnotation(html) {
      if (!html) return "";
      var div = document.createElement("div");
      div.innerHTML = html;
      return (div.textContent || div.innerText || "").trim();
    }

    /** Walk a fragment/node tree in document order; build Notion string.
     * - Plain text is kept with spaces normalized.
     * - KaTeX equations become $$latex$ (one trailing $) so that after paste in Notion,
     *   typing the final $ triggers rendering.
     * - Basic structure (headings, paragraphs, list items, line breaks) is preserved
     *   using Markdown-like formatting so Notion can keep layout. */
  }, {
    key: "getNotionFormatFromFragment",
    value: function getNotionFormatFromFragment(node) {
      var out = "";
      if (!node) return out;

      // Text: collapse spaces/tabs but let structural newlines be added by elements
      if (node.nodeType === Node.TEXT_NODE) {
        return (node.textContent || "").replace(/[ \t]+/g, " ");
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        var el = node;

        // KaTeX equation: use $$latex$ so typing final $ in Notion converts it
        if (el.classList && el.classList.contains("katex")) {
          var annotation = el.querySelector(".katex-mathml annotation");
          var raw = annotation ? annotation.innerHTML : "";
          var latex = this.decodeLatexFromAnnotation(raw);
          return latex ? "$$".concat(latex, "$") : "";
        }
        var tag = el.tagName;

        // Explicit line break
        if (tag === "BR") {
          return "\n";
        }

        // Recursively collect children
        for (var i = 0; i < el.childNodes.length; i++) {
          out += this.getNotionFormatFromFragment(el.childNodes[i]);
        }

        // Bold / strong text -> Markdown **bold**
        if (tag === "B" || tag === "STRONG") {
          var inner = out.trim();
          return inner ? "**".concat(inner, "**") : "";
        }

        // Italic / emphasis -> Markdown *italic*
        if (tag === "I" || tag === "EM") {
          var _inner = out.trim();
          return _inner ? "*".concat(_inner, "*") : "";
        }

        // Headings: map to Markdown-style so Notion can convert on paste
        if (tag && /^H[1-6]$/.test(tag)) {
          var level = parseInt(tag.substring(1), 10) || 1;
          var hashes = "#".repeat(Math.min(level, 3));
          var _inner2 = out.trim();
          return _inner2 ? "".concat(hashes, " ").concat(_inner2, "\n\n") : "";
        }

        // List items: prefix with "- "
        if (tag === "LI") {
          var _inner3 = out.trim();
          return _inner3 ? "- ".concat(_inner3, "\n") : "";
        }

        // Paragraph-like blocks: add blank line after
        if (tag === "P" || tag === "DIV" || tag === "SECTION" || tag === "ARTICLE") {
          var _inner4 = out.trim();
          return _inner4 ? "".concat(_inner4, "\n\n") : "";
        }

        // Default: just return concatenated children
        return out;
      }

      // DocumentFragment (e.g. from range.cloneContents()) — walk its children
      if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        for (var _i = 0; _i < node.childNodes.length; _i++) {
          out += this.getNotionFormatFromFragment(node.childNodes[_i]);
        }
      }
      return out;
    }

    /** Build a single string for Notion from the current selection.
     * Keeps equations as $$latex$ segments and preserves basic layout (headings, paragraphs, lists). */
  }, {
    key: "getNotionFormatFromSelection",
    value: function getNotionFormatFromSelection(selection) {
      if (!selection || selection.rangeCount === 0) return "";
      var range = selection.getRangeAt(0);
      var fragment = range.cloneContents();
      var raw = this.getNotionFormatFromFragment(fragment);
      // Normalize spaces but preserve newlines that encode structure
      var normalized = (raw || "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");
      return normalized.trim();
    }

    /** Copy text to clipboard; use execCommand fallback if clipboard API fails (e.g. in some iframes) */
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
      // Don't replace the button if it's already showing "✓ Copied!" — let it stay until timeout
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

      // Capture text now; selection is often cleared when user clicks the button
      var textToCopy = this.getNotionFormatFromSelection(selection);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gpt-eq-copy-for-notion";
      btn.textContent = "Copy for Notion";
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        // Use captured text; if empty, try current selection once
        var toCopy = textToCopy;
        if (!toCopy) toCopy = _this.getNotionFormatFromSelection(window.getSelection());
        _this.copyTextToClipboard(toCopy || "").then(function (didCopy) {
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
var notionCopyGPT = new NotionCopyGPT();
/******/ })()
;
//# sourceMappingURL=content.js.map