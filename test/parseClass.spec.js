import { parseClass } from "isaaccss/lib/core/parseClass.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const parse = (strings, ...args) => {
  const className = String.raw(strings, ...args);
  const parsed = parseClass(className);
  if (parsed) {
    assert.equal(parsed.className, className);
    delete parsed.className;
    Object.entries(parsed).forEach(([key, value]) => value === undefined && delete parsed[key]);
  }
  return parsed;
};

describe("parseClass", () => {
  it("property", () => {
    assert.deepEqual(parse`x:0`, { property: "x", value: "0", specificity: 1 });
    assert.equal(parse`xx:0`, undefined);
    assert.equal(parse`-x:0`, undefined);
    assert.deepEqual(parse`--x:0`, { property: "--x", value: "0", specificity: 1 });
    assert.deepEqual(parse`--x-y:0`, { property: "--x-y", value: "0", specificity: 1 });
    assert.deepEqual(parse`--x--y:0`, { property: "--x--y", value: "0", specificity: 1 });
    assert.deepEqual(parse`-webkit-appearance:button`, { property: "-webkit-appearance", value: "button", specificity: 1 });
  });

  it("value", () => {
    assert.deepEqual(parse`x:$y`, { property: "x", value: "var(--y)", specificity: 1 });
    assert.deepEqual(parse`x:$-y`, { property: "x", value: "var(---y)", specificity: 1 });
    assert.deepEqual(parse`x:$y-z`, { property: "x", value: "var(--y-z)", specificity: 1 });
    assert.deepEqual(parse`x:$y1`, { property: "x", value: "var(--y1)", specificity: 1 });
    assert.deepEqual(parse`x:$y-1`, { property: "x", value: "var(--y-1)", specificity: 1 });
    assert.deepEqual(parse`x:calc($y_-_100%)`, { property: "x", value: "calc(var(--y) - 100%)", specificity: 1 });
    assert.deepEqual(parse`x:calc($y-$z)`, { property: "x", value: "calc(var(--y)-var(--z))", specificity: 1 });
    assert.deepEqual(parse`x:calc($y+$z)`, { property: "x", value: "calc(var(--y)+var(--z))", specificity: 1 });
    assert.deepEqual(parse`x:calc($y*$z)`, { property: "x", value: "calc(var(--y)*var(--z))", specificity: 1 });
    assert.deepEqual(parse`x:calc($y/$z)`, { property: "x", value: "calc(var(--y)/var(--z))", specificity: 1 });
    assert.deepEqual(parse`x:hsl($H,$S,$L)`, { property: "x", value: "hsl(var(--H),var(--S),var(--L))", specificity: 1 });
  });

  it("media", () => {
    assert.equal(parse`@print`, undefined);
    assert.equal(parse`@print/`, undefined);
    assert.equal(parse`@print/x`, undefined);
    assert.equal(parse`@print/x:`, undefined);
    assert.deepEqual(parse`@print/x:0`, { media: "print", property: "x", value: "0", specificity: 1 });
    assert.deepEqual(parse`@print/x:0`, { media: "print", property: "x", value: "0", specificity: 1 });
    assert.deepEqual(parse`@hover:hover/x:0`, { media: "(hover:hover)", property: "x", value: "0", specificity: 1 });
    assert.deepEqual(parse`@min-width:1px_and_max-width:2px/x:0`, { media: "(min-width:1px) and (max-width:2px)", property: "x", value: "0", specificity: 1 });
    assert.deepEqual(parse`@width<1px/x:0`, { media: "(width<1px)", property: "x", value: "0", specificity: 1 });
    assert.deepEqual(parse`@width<=1px/x:0`, { media: "(width<=1px)", property: "x", value: "0", specificity: 1 });
    assert.deepEqual(parse`@width>=1px/x:0`, { media: "(width>=1px)", property: "x", value: "0", specificity: 1 });
    assert.deepEqual(parse`@width>1px/x:0`, { media: "(width>1px)", property: "x", value: "0", specificity: 1 });
    assert.deepEqual(parse`@1px<=width<2px/x:0`, { media: "(1px<=width<2px)", property: "x", value: "0", specificity: 1 });
    assert.deepEqual(parse`@width>1px_and_height>2px/x:0`, { media: "(width>1px) and (height>2px)", property: "x", value: "0", specificity: 1 });
  });

  it("specificity", () => {
    assert.deepEqual(parse`x:0`, { property: "x", value: "0", specificity: 1 });
    assert.deepEqual(parse`x:0*`, { property: "x", value: "0", specificity: 2 });
    assert.deepEqual(parse`x:0**`, { property: "x", value: "0", specificity: 3 });
    assert.deepEqual(parse`x:0?`, { layer: "", property: "x", value: "0", specificity: 0 });
    assert.deepEqual(parse`x:0*?`, { layer: "", property: "x", value: "0", specificity: 1 });
    assert.deepEqual(parse`x:0!`, { property: "x", value: "0", specificity: 1, important: true });
    assert.deepEqual(parse`x:0!?`, { layer: "", property: "x", value: "0", specificity: 0, important: true });
    assert.deepEqual(parse`x:0*!?`, { layer: "", property: "x", value: "0", specificity: 1, important: true });
  });
});
