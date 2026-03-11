import { initEquationAssistant } from "../equationAssistant";

jest.useFakeTimers();

jest.mock("../../core/mathExtraction", () => ({
  extractMath: jest.fn((_provider: string, _sel: Selection | null) => "$<x^2>$"),
  normalizeGeminiClipboardText: jest.fn((text: string) => text),
}));

jest.mock("../../core/clipboard", () => ({
  copyTextToClipboard: jest.fn(() => Promise.resolve(true)),
}));

jest.mock("../../core/i18n", () => ({
  getDefaultLanguage: () => "en",
  loadLanguage: () => Promise.resolve("en"),
  t: (key: string) => {
    if (key === "copyButton") return "Copy for Notion";
    if (key === "copySuccess") return "✓ Copied!";
    return key;
  },
}));

describe("equationAssistant integration", () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="root">Some math here</div>`;
    const sel = window.getSelection();
    if (sel) sel.removeAllRanges();

    // stub chrome.storage.local for tests
    (global as any).chrome = {
      storage: {
        local: {
          set: jest.fn(),
        },
      },
    };

    // jsdom Range does not implement getClientRects; stub it so positioning logic can run.
    if (!(Range.prototype as any).getClientRects) {
      (Range.prototype as any).getClientRects = () =>
        ({
          length: 1,
          0: { top: 10, left: 10, bottom: 20, right: 100, height: 10, width: 90 },
        } as any);
    }
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  function selectAllText() {
    const el = document.getElementById("root") as HTMLElement;
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    if (!sel) throw new Error("No selection");
    sel.removeAllRanges();
    sel.addRange(range);
  }

  it("shows the copy button when selection has extractable math", () => {
    initEquationAssistant("chatgpt");

    selectAllText();
    document.dispatchEvent(new MouseEvent("mouseup"));
    document.dispatchEvent(new Event("selectionchange"));

    // advance timers used inside EquationAssistant
    jest.runAllTimers();

    const btn = document.querySelector("button.gpt-eq-copy-for-notion") as HTMLButtonElement | null;
    expect(btn).not.toBeNull();
    expect(btn!.textContent).toBe("Copy for Notion");
  });

  it("writes to chrome.storage and clipboard on click", async () => {
    const { copyTextToClipboard } = await import("../../core/clipboard");

    initEquationAssistant("chatgpt");
    selectAllText();
    document.dispatchEvent(new MouseEvent("mouseup"));
    document.dispatchEvent(new Event("selectionchange"));
    jest.runAllTimers();

    const btn = document.querySelector("button.gpt-eq-copy-for-notion") as HTMLButtonElement | null;
    expect(btn).not.toBeNull();

    btn!.click();

    await Promise.resolve(); // allow promise microtasks from click handler

    expect((global as any).chrome.storage.local.set).toHaveBeenCalled();
    expect(copyTextToClipboard).toHaveBeenCalled();
  });
});

