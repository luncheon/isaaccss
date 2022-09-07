import { parseClass } from "isaaccss/api/parseClass.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const parse = (strings, ...args) => {
  const className = String.raw(strings, ...args);
  const parsed = parseClass(className);
  if (parsed) {
    assert.equal(parsed.className, className);
    delete parsed.className;
    parsed.properties.forEach(p => p.important || delete p.important);
    parsed.unknownProperties.length === 0 && delete parsed.unknownProperties;
  }
  return parsed;
};

describe("parseClass", () => {
  it("property", () => {
    assert.deepEqual(parse`x:0`, { specificity: 1, properties: [{ name: "x", value: "0" }] });
    assert.deepEqual(parse`xx:0`, { specificity: 1, properties: [], unknownProperties: ["xx:0"] });
    assert.deepEqual(parse`-x:0`, { specificity: 1, properties: [], unknownProperties: ["-x:0"] });
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
    assert.deepEqual(parse`@print`, { specificity: 1, properties: [], unknownProperties: ["@print"] });
    assert.deepEqual(parse`@print/`, { specificity: 1, properties: [], unknownProperties: ["@print/"] });
    assert.deepEqual(parse`@print/x`, { specificity: 1, properties: [], unknownProperties: ["@print/x"] });
    assert.deepEqual(parse`@print/x:`, { specificity: 1, properties: [], unknownProperties: ["@print/x:"] });
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

  it("multiple properties", () => {
    assert.deepEqual(parse`x:0;y:1`, {
      specificity: 1,
      properties: [
        { name: "x", value: "0" },
        { name: "y", value: "1" },
      ],
    });
    assert.deepEqual(parse`:hover/x:0!;y:1`, {
      specificity: 1,
      selector: ":hover",
      properties: [
        { name: "x", value: "0", important: true },
        { name: "y", value: "1" },
      ],
    });
    assert.deepEqual(parse`@w<sm/x:0;y:1!`, {
      specificity: 1,
      media: "(w<sm)",
      properties: [
        { name: "x", value: "0" },
        { name: "y", value: "1", important: true },
      ],
    });
    assert.deepEqual(parse`@print/::before/xx:0;y:1`, {
      specificity: 1,
      media: "print",
      selector: "::before",
      properties: [{ name: "y", value: "1" }],
      unknownProperties: ["xx:0"],
    });
    assert.deepEqual(parse`x:0;yy:1?`, {
      specificity: 0,
      layer: "",
      properties: [{ name: "x", value: "0" }],
      unknownProperties: ["yy:1"],
    });
    assert.deepEqual(parse`x:0;y:1;d:2**`, {
      specificity: 3,
      properties: [
        { name: "x", value: "0" },
        { name: "y", value: "1" },
        { name: "d", value: "2" },
      ],
    });
  });
});
