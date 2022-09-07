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
    parsed.properties.forEach(p => p.important || delete p.important);
  }
  return parsed;
};

describe("parseClass", () => {
  it("property", () => {
    assert.deepEqual(parse`x:0`, { specificity: 1, properties: [{ name: "x", value: "0" }] });
    assert.equal(parse`xx:0`, undefined);
    assert.equal(parse`-x:0`, undefined);
    assert.deepEqual(parse`--x:0`, { specificity: 1, properties: [{ name: "--x", value: "0" }] });
    assert.deepEqual(parse`--x-y:0`, { specificity: 1, properties: [{ name: "--x-y", value: "0" }] });
    assert.deepEqual(parse`--x--y:0`, { specificity: 1, properties: [{ name: "--x--y", value: "0" }] });
    assert.deepEqual(parse`-webkit-appearance:button`, { specificity: 1, properties: [{ name: "-webkit-appearance", value: "button" }] });
  });

  it("value", () => {
    assert.deepEqual(parse`x:$y`, { specificity: 1, properties: [{ name: "x", value: "var(--y)" }] });
    assert.deepEqual(parse`x:$-y`, { specificity: 1, properties: [{ name: "x", value: "var(---y)" }] });
    assert.deepEqual(parse`x:$y-z`, { specificity: 1, properties: [{ name: "x", value: "var(--y-z)" }] });
    assert.deepEqual(parse`x:$y1`, { specificity: 1, properties: [{ name: "x", value: "var(--y1)" }] });
    assert.deepEqual(parse`x:$y-1`, { specificity: 1, properties: [{ name: "x", value: "var(--y-1)" }] });
    assert.deepEqual(parse`x:calc($y_-_100%)`, { specificity: 1, properties: [{ name: "x", value: "calc(var(--y) - 100%)" }] });
    assert.deepEqual(parse`x:calc($y-$z)`, { specificity: 1, properties: [{ name: "x", value: "calc(var(--y)-var(--z))" }] });
    assert.deepEqual(parse`x:calc($y+$z)`, { specificity: 1, properties: [{ name: "x", value: "calc(var(--y)+var(--z))" }] });
    assert.deepEqual(parse`x:calc($y*$z)`, { specificity: 1, properties: [{ name: "x", value: "calc(var(--y)*var(--z))" }] });
    assert.deepEqual(parse`x:calc($y/$z)`, { specificity: 1, properties: [{ name: "x", value: "calc(var(--y)/var(--z))" }] });
    assert.deepEqual(parse`x:hsl($H,$S,$L)`, { specificity: 1, properties: [{ name: "x", value: "hsl(var(--H),var(--S),var(--L))" }] });
  });

  it("media", () => {
    assert.equal(parse`@print`, undefined);
    assert.equal(parse`@print/`, undefined);
    assert.equal(parse`@print/x`, undefined);
    assert.equal(parse`@print/x:`, undefined);
    assert.deepEqual(parse`@print/x:0`, { media: "print", specificity: 1, properties: [{ name: "x", value: "0" }] });
    assert.deepEqual(parse`@print/x:0`, { media: "print", specificity: 1, properties: [{ name: "x", value: "0" }] });
    assert.deepEqual(parse`@hover:hover/x:0`, { media: "(hover:hover)", specificity: 1, properties: [{ name: "x", value: "0" }] });
    assert.deepEqual(parse`@min-width:1px_and_max-width:2px/x:0`, { media: "(min-width:1px) and (max-width:2px)", specificity: 1, properties: [{ name: "x", value: "0" }] });
    assert.deepEqual(parse`@width<1px/x:0`, { media: "(width<1px)", specificity: 1, properties: [{ name: "x", value: "0" }] });
    assert.deepEqual(parse`@width<=1px/x:0`, { media: "(width<=1px)", specificity: 1, properties: [{ name: "x", value: "0" }] });
    assert.deepEqual(parse`@width>=1px/x:0`, { media: "(width>=1px)", specificity: 1, properties: [{ name: "x", value: "0" }] });
    assert.deepEqual(parse`@width>1px/x:0`, { media: "(width>1px)", specificity: 1, properties: [{ name: "x", value: "0" }] });
    assert.deepEqual(parse`@1px<=width<2px/x:0`, { media: "(1px<=width<2px)", specificity: 1, properties: [{ name: "x", value: "0" }] });
    assert.deepEqual(parse`@width>1px_and_height>2px/x:0`, { media: "(width>1px) and (height>2px)", specificity: 1, properties: [{ name: "x", value: "0" }] });
  });

  it("specificity", () => {
    assert.deepEqual(parse`x:0`, { specificity: 1, properties: [{ name: "x", value: "0" }] });
    assert.deepEqual(parse`x:0*`, { specificity: 2, properties: [{ name: "x", value: "0" }] });
    assert.deepEqual(parse`x:0**`, { specificity: 3, properties: [{ name: "x", value: "0" }] });
    assert.deepEqual(parse`x:0?`, { layer: "", specificity: 0, properties: [{ name: "x", value: "0" }] });
    assert.deepEqual(parse`x:0?*`, { layer: "", specificity: 1, properties: [{ name: "x", value: "0" }] });
    assert.deepEqual(parse`x:0!`, { specificity: 1, properties: [{ name: "x", value: "0", important: true }] });
    assert.deepEqual(parse`x:0!*`, { specificity: 2, properties: [{ name: "x", value: "0", important: true }] });
    assert.deepEqual(parse`x:0!?`, { layer: "", specificity: 0, properties: [{ name: "x", value: "0", important: true }] });
    assert.deepEqual(parse`x:0!?*`, { layer: "", specificity: 1, properties: [{ name: "x", value: "0", important: true }] });
  });
});
