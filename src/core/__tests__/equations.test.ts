import {
  collectEquationRanges,
  deleteRangeSafely,
  EQUATION_OPEN_DELIM,
  EQUATION_CLOSE_DELIM,
} from "../equations";

describe("equations", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("exposes asymmetric delimiters", () => {
    expect(EQUATION_OPEN_DELIM).toBe("$<");
    expect(EQUATION_CLOSE_DELIM).toBe(">$");
  });

  it("collects a single equation target", () => {
    const div = document.createElement("div");
    div.textContent = "Value: $<x^2>$ end";
    document.body.appendChild(div);

    const targets = collectEquationRanges(div);
    expect(targets).toHaveLength(1);

    const [first] = targets;
    const innerText = first.inner.toString();
    const leftText = first.left.toString();
    const rightText = first.right.toString();

    expect(innerText).toBe("x^2");
    expect(leftText).toBe("$<");
    expect(rightText).toBe(">$");
  });

  it("collects multiple equations in order", () => {
    const div = document.createElement("div");
    div.textContent = "$<a>$ and $<b>$";
    document.body.appendChild(div);

    const targets = collectEquationRanges(div);
    expect(targets).toHaveLength(2);
    expect(targets[0].inner.toString()).toBe("a");
    expect(targets[1].inner.toString()).toBe("b");
  });

  it("ignores unmatched opening delimiters", () => {
    const div = document.createElement("div");
    div.textContent = "broken $<a$ string";
    document.body.appendChild(div);

    const targets = collectEquationRanges(div);
    expect(targets).toHaveLength(0);
  });

  it("supports delimiters across multiple text nodes", () => {
    const div = document.createElement("div");
    const t1 = document.createTextNode("prefix ");
    const t2 = document.createTextNode("$<x");
    const t3 = document.createTextNode("^2>$ suffix");
    div.appendChild(t1);
    div.appendChild(t2);
    div.appendChild(t3);
    document.body.appendChild(div);

    const targets = collectEquationRanges(div);
    expect(targets).toHaveLength(1);
    expect(targets[0].inner.toString()).toBe("x^2");
  });

  it("pairs nested-like sequences using stack behavior", () => {
    const div = document.createElement("div");
    div.textContent = "$<a $<b>$ c>$";
    document.body.appendChild(div);

    const targets = collectEquationRanges(div);
    expect(targets).toHaveLength(2);
    const innerValues = targets.map((t) => t.inner.toString());
    expect(innerValues).toContain("b");
    expect(innerValues).toContain("a $<b>$ c");
  });

  it("deleteRangeSafely removes text inside a single node", () => {
    const text = document.createTextNode("abcdef");
    const div = document.createElement("div");
    div.appendChild(text);
    document.body.appendChild(div);

    const range = document.createRange();
    range.setStart(text, 2);
    range.setEnd(text, 4);
    deleteRangeSafely(range);

    expect(text.textContent).toBe("abef");
  });

  it("deleteRangeSafely falls back to execCommand for multi-node ranges", () => {
    const text1 = document.createTextNode("abc");
    const span = document.createElement("span");
    span.textContent = "DEF";
    const div = document.createElement("div");
    div.appendChild(text1);
    div.appendChild(span);
    document.body.appendChild(div);

    // jsdom does not implement document.execCommand by default; provide a stub so we can spy on it.
    (document as any).execCommand = () => true;
    const execSpy = jest.spyOn(document as any, "execCommand").mockImplementation(() => true);

    const range = document.createRange();
    range.setStart(text1, 1);
    range.setEnd(span.firstChild as Text, 2);

    deleteRangeSafely(range);
    expect(execSpy).toHaveBeenCalledWith("delete");

    execSpy.mockRestore();
  });
});

