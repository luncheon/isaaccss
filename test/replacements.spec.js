import { parseClass } from "isaaccss/lib/core/parseClass.js";
import { defaultReplacements } from "isaaccss/lib/replacements/default.js";
import { mergeReplacements } from "isaaccss/lib/replacements/merge.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const readmeReplacements = mergeReplacements([
  defaultReplacements,
  {
    media: {
      dark: "prefers-color-scheme:dark",
      light: "prefers-color-scheme:light",
      sm: "640px",
      md: "768px",
    },
    selector: {
      "::a": "::after",
      "::b": "::before",
      ":h": ":hover",
      ":f": ":focus",
    },
    property: {
      items: "align-items",
      justify: "justify-content",
    },
    value: {
      abs: "absolute",
      rel: "relative",
    },
  },
]);

const parser =
  parserOptions =>
  (strings, ...args) => {
    const className = String.raw(strings, ...args);
    const parsed = parseClass(className, parserOptions);
    if (parsed) {
      assert.equal(parsed.className, className);
      delete parsed.className;
      Object.entries(parsed).forEach(([key, value]) => value === undefined && delete parsed[key]);
    }
    return parsed;
  };

describe("replacements", () => {
  describe("default", () => {
    const replacements = defaultReplacements;

    it("@media &, |, !", () => {
      const parse = parser({ replacements });
      assert.deepEqual(parse`@print&hover:hover/d:none`, { media: "print and (hover:hover)", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`@print|hover:hover/d:none`, { media: "print or (hover:hover)", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`@!print/d:none`, { media: "not print", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`@!hover:hover/d:none`, { media: "not (hover:hover)", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`@!print&hover:hover/d:none`, { media: "not print and (hover:hover)", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`@print&!hover:hover/d:none`, { media: "print and not (hover:hover)", property: "display", value: "none", specificity: 1 });
    });

    it("@media h, w", () => {
      const parse = parser({ replacements });
      assert.deepEqual(parse`@h>0/d:none`, { media: "(height>0)", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`@min-h:1px/d:none`, { media: "(min-height:1px)", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`@max-h:2px/d:none`, { media: "(max-height:2px)", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`@w>0/d:none`, { media: "(width>0)", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`@min-w:1px/d:none`, { media: "(min-width:1px)", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`@max-w:2px/d:none`, { media: "(max-width:2px)", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`@h>=0&!w>=1px|h<2px&w<3px/d:none`, { media: "(height>=0) and not (width>=1px) or (height<2px) and (width<3px)", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`@dark/d:none`, { media: "dark", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`@light/d:none`, { media: "light", property: "display", value: "none", specificity: 1 });
    });

    it("property", () => {
      const parse = parser({ replacements });
      assert.deepEqual(parse`b:0`, { property: "border", value: "0", specificity: 1 });
      assert.deepEqual(parse`b-b:0`, { property: "border-bottom", value: "0", specificity: 1 });
      assert.deepEqual(parse`b-b-c:0`, { property: "border-bottom-color", value: "0", specificity: 1 });
    });
  });

  describe("readme", () => {
    const replacements = readmeReplacements;

    it("@media", () => {
      const parse = parser({ replacements });
      assert.deepEqual(parse`@print&hover:hover/d:none`, { media: "print and (hover:hover)", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`@print|hover:hover/d:none`, { media: "print or (hover:hover)", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`@!print/d:none`, { media: "not print", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`@!hover:hover/d:none`, { media: "not (hover:hover)", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`@!print&hover:hover/d:none`, { media: "not print and (hover:hover)", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`@print&!hover:hover/d:none`, { media: "print and not (hover:hover)", property: "display", value: "none", specificity: 1 });

      assert.deepEqual(parse`@dark/d:none`, { media: "(prefers-color-scheme:dark)", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`@light/d:none`, { media: "(prefers-color-scheme:light)", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`@w<sm/d:none`, { media: "(width<640px)", property: "display", value: "none", specificity: 1 });
    });

    it("selector", () => {
      const parse = parser({ replacements });
      assert.deepEqual(parse`::a/d:none`, { selector: "::after", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`@dark/::b/d:none`, { media: "(prefers-color-scheme:dark)", selector: "::before", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`:f/d:none`, { selector: ":focus", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`@light/:h/d:none`, { media: "(prefers-color-scheme:light)", selector: ":hover", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`:f::a/d:none`, { selector: ":focus::after", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`:f>p::a/d:none`, { selector: ":focus>p::after", property: "display", value: "none", specificity: 1 });
      assert.deepEqual(parse`>p:f::a/d:none`, { selector: ">p:focus::after", property: "display", value: "none", specificity: 1 });
    });

    it("property", () => {
      const parse = parser({ replacements });
      assert.deepEqual(parse`b:0`, { property: "border", value: "0", specificity: 1 });
      assert.deepEqual(parse`b-b:0`, { property: "border-bottom", value: "0", specificity: 1 });
      assert.deepEqual(parse`b-b-c:0`, { property: "border-bottom-color", value: "0", specificity: 1 });
      assert.deepEqual(parse`items:0`, { property: "align-items", value: "0", specificity: 1 });
      assert.deepEqual(parse`justify:0`, { property: "justify-content", value: "0", specificity: 1 });
      assert.deepEqual(parse`justify-items:0`, { property: "justify-items", value: "0", specificity: 1 });
    });

    it("value", () => {
      const parse = parser({ replacements });
      assert.deepEqual(parse`pos:abs`, { property: "position", value: "absolute", specificity: 1 });
      assert.deepEqual(parse`pos:rel`, { property: "position", value: "relative", specificity: 1 });
    });
  });
});
