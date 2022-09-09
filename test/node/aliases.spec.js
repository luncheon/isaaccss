import { defaultAliases } from "isaaccss/aliases/default.js";
import { parseClass } from "isaaccss/api/parseClass.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const readmeAliases = [
  defaultAliases,
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
    value: [
      [
        "box-shadow",
        {
          sm: "0 1px 2px hsla($shadow-hsl / 0.1)",
          md: "0 1px 2px hsla($shadow-hsl / 0.1),0 3px 6px hsla($shadow-hsl / 0.1)",
        },
      ],
      [
        // `m:[1]`->{margin:.0625rem} `m:[16]`->{margin:1rem}
        /^margin|^padding|^font-size$/,
        [/\[(-?\d*\.?\d+)\]/g, (_, $1) => `${+$1 / 16}rem`.replace(/^0/, "")],
      ],
    ],
  },
];

const parser =
  parserOptions =>
  (strings, ...args) => {
    const className = String.raw(strings, ...args);
    const parsed = parseClass(className, parserOptions);
    if (parsed) {
      assert.equal(parsed.className, className);
      delete parsed.className;
      parsed.properties.forEach(p => p.important || delete p.important);
      parsed.unknownProperties.length === 0 && delete parsed.unknownProperties;
    }
    return parsed;
  };

describe("aliases", () => {
  describe("default", () => {
    const aliases = defaultAliases;

    it("@media &, |, !", () => {
      const parse = parser({ aliases });
      const properties = [{ name: "display", value: "none" }];
      assert.deepEqual(parse`@print&hover:hover/d:none`, { media: "print and (hover:hover)", specificity: 1, properties });
      assert.deepEqual(parse`@print|hover:hover/d:none`, { media: "print or (hover:hover)", specificity: 1, properties });
      assert.deepEqual(parse`@!print/d:none`, { media: "not print", specificity: 1, properties });
      assert.deepEqual(parse`@!hover:hover/d:none`, { media: "not (hover:hover)", specificity: 1, properties });
      assert.deepEqual(parse`@!print&hover:hover/d:none`, { media: "not print and (hover:hover)", specificity: 1, properties });
      assert.deepEqual(parse`@print&!hover:hover/d:none`, { media: "print and not (hover:hover)", specificity: 1, properties });
    });

    it("@media h, w", () => {
      const parse = parser({ aliases });
      const properties = [{ name: "display", value: "none" }];
      assert.deepEqual(parse`@h>0/d:none`, { media: "(height>0)", specificity: 1, properties });
      assert.deepEqual(parse`@min-h:1px/d:none`, { media: "(min-height:1px)", specificity: 1, properties });
      assert.deepEqual(parse`@max-h:2px/d:none`, { media: "(max-height:2px)", specificity: 1, properties });
      assert.deepEqual(parse`@w>0/d:none`, { media: "(width>0)", specificity: 1, properties });
      assert.deepEqual(parse`@min-w:1px/d:none`, { media: "(min-width:1px)", specificity: 1, properties });
      assert.deepEqual(parse`@max-w:2px/d:none`, { media: "(max-width:2px)", specificity: 1, properties });
      assert.deepEqual(parse`@h>=0&!w>=1px|h<2px&w<3px/d:none`, { media: "(height>=0) and not (width>=1px) or (height<2px) and (width<3px)", specificity: 1, properties });
      assert.deepEqual(parse`@dark/d:none`, { media: "dark", specificity: 1, properties });
      assert.deepEqual(parse`@light/d:none`, { media: "light", specificity: 1, properties });
    });

    it("property", () => {
      const parse = parser({ aliases });
      assert.deepEqual(parse`b:0`, { specificity: 1, properties: [{ name: "border", value: "0" }] });
      assert.deepEqual(parse`b-b:0`, { specificity: 1, properties: [{ name: "border-bottom", value: "0" }] });
      assert.deepEqual(parse`b-b-c:0`, { specificity: 1, properties: [{ name: "border-bottom-color", value: "0" }] });
    });
  });

  describe("readme", () => {
    const aliases = readmeAliases;

    it("@media", () => {
      const parse = parser({ aliases });
      const properties = [{ name: "display", value: "none" }];
      assert.deepEqual(parse`@print&hover:hover/d:none`, { media: "print and (hover:hover)", specificity: 1, properties });
      assert.deepEqual(parse`@print|hover:hover/d:none`, { media: "print or (hover:hover)", specificity: 1, properties });
      assert.deepEqual(parse`@!print/d:none`, { media: "not print", specificity: 1, properties });
      assert.deepEqual(parse`@!hover:hover/d:none`, { media: "not (hover:hover)", specificity: 1, properties });
      assert.deepEqual(parse`@!print&hover:hover/d:none`, { media: "not print and (hover:hover)", specificity: 1, properties });
      assert.deepEqual(parse`@print&!hover:hover/d:none`, { media: "print and not (hover:hover)", specificity: 1, properties });

      assert.deepEqual(parse`@dark/d:none`, { media: "(prefers-color-scheme:dark)", specificity: 1, properties });
      assert.deepEqual(parse`@light/d:none`, { media: "(prefers-color-scheme:light)", specificity: 1, properties });
      assert.deepEqual(parse`@w<sm/d:none`, { media: "(width<640px)", specificity: 1, properties });
    });

    it("selector", () => {
      const parse = parser({ aliases });
      const properties = [{ name: "display", value: "none" }];
      assert.deepEqual(parse`::a/d:none`, { selector: "::after", specificity: 1, properties });
      assert.deepEqual(parse`@dark/::b/d:none`, { media: "(prefers-color-scheme:dark)", selector: "::before", specificity: 1, properties });
      assert.deepEqual(parse`:f/d:none`, { selector: ":focus", specificity: 1, properties });
      assert.deepEqual(parse`@light/:h/d:none`, { media: "(prefers-color-scheme:light)", selector: ":hover", specificity: 1, properties });
      assert.deepEqual(parse`:f::a/d:none`, { selector: ":focus::after", specificity: 1, properties });
      assert.deepEqual(parse`:f>p::a/d:none`, { selector: ":focus>p::after", specificity: 1, properties });
      assert.deepEqual(parse`>p:f::a/d:none`, { selector: ">p:focus::after", specificity: 1, properties });
    });

    it("property", () => {
      const parse = parser({ aliases });
      assert.deepEqual(parse`b:0`, { specificity: 1, properties: [{ name: "border", value: "0" }] });
      assert.deepEqual(parse`b-b:0`, { specificity: 1, properties: [{ name: "border-bottom", value: "0" }] });
      assert.deepEqual(parse`b-b-c:0`, { specificity: 1, properties: [{ name: "border-bottom-color", value: "0" }] });
      assert.deepEqual(parse`items:0`, { specificity: 1, properties: [{ name: "align-items", value: "0" }] });
      assert.deepEqual(parse`justify:0`, { specificity: 1, properties: [{ name: "justify-content", value: "0" }] });
      assert.deepEqual(parse`justify-items:0`, { specificity: 1, properties: [{ name: "justify-items", value: "0" }] });
    });

    it("value", () => {
      const parse = parser({ aliases });
      assert.deepEqual(parse`box-shadow:sm`, { specificity: 1, properties: [{ name: "box-shadow", value: "0 1px 2px hsla(var(--shadow-hsl) / 0.1)" }] });
      assert.deepEqual(parse`box-shadow:md`, { specificity: 1, properties: [{ name: "box-shadow", value: "0 1px 2px hsla(var(--shadow-hsl) / 0.1),0 3px 6px hsla(var(--shadow-hsl) / 0.1)" }] });
      assert.deepEqual(parse`m:[1]`, { specificity: 1, properties: [{ name: "margin", value: ".0625rem" }] });
      assert.deepEqual(parse`m-l:[16]`, { specificity: 1, properties: [{ name: "margin-left", value: "1rem" }] });
      assert.deepEqual(parse`font-size:[24]`, { specificity: 1, properties: [{ name: "font-size", value: "1.5rem" }] });
      assert.deepEqual(parse`p-b:[.5]`, { specificity: 1, properties: [{ name: "padding-bottom", value: ".03125rem" }] });
      assert.deepEqual(parse`p:[1.5]`, { specificity: 1, properties: [{ name: "padding", value: ".09375rem" }] });
    });
  });
});
