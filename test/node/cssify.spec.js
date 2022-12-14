import { cssify } from "isaaccss/api/cssify.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("cssify", () => {
  it("property-value", () => {
    assert.equal(cssify([{ className: "a", properties: [{ name: "x", value: "0", important: false }] }]), ".a{x:0}");
    assert.equal(cssify([{ className: "b", properties: [{ name: "y", value: "1", important: true }] }]), ".b{y:1!important}");
    assert.equal(cssify([{ className: "#c", properties: [{ name: "z", value: "2", important: false }] }]), ".\\#c{z:2}");
    assert.equal(
      cssify([
        {
          className: "a",
          properties: [
            { name: "x", value: "0", important: false },
            { name: "y", value: "1", important: true },
          ],
        },
      ]),
      ".a{x:0;y:1!important}",
    );
  });

  it("media, container, layer", () => {
    assert.equal(
      cssify([
        { className: "a", properties: [{ name: "x", value: "0" }], media: "m" },
        { className: "b", properties: [{ name: "y", value: "1" }], media: "n" },
        { className: "c", properties: [{ name: "z", value: "2" }] },
      ]),
      ".c{z:2}@media m{.a{x:0}}@media n{.b{y:1}}",
    );
    assert.equal(
      cssify([
        { className: "a", properties: [{ name: "x", value: "0" }], media: "m" },
        { className: "b", properties: [{ name: "y", value: "1" }], media: "m" },
      ]),
      "@media m{.a{x:0}.b{y:1}}",
    );

    assert.equal(
      cssify([
        { className: "a", properties: [{ name: "x", value: "0" }], container: "(w<0)" },
        { className: "b", properties: [{ name: "y", value: "1" }], container: "(w>0)" },
        { className: "c", properties: [{ name: "z", value: "2" }] },
      ]),
      ".c{z:2}@container (w<0){.a{x:0}}@container (w>0){.b{y:1}}",
    );
    assert.equal(
      cssify([
        { className: "a", properties: [{ name: "x", value: "0" }], container: "(w>0)" },
        { className: "b", properties: [{ name: "y", value: "1" }], container: "(w>0)" },
      ]),
      "@container (w>0){.a{x:0}.b{y:1}}",
    );

    assert.equal(
      cssify([
        { className: "a", properties: [{ name: "x", value: "0" }], media: "m", container: "(w<0)" },
        { className: "b", properties: [{ name: "y", value: "1" }], media: "m", container: "(w>0)" },
      ]),
      "@media m{@container (w<0){.a{x:0}}@container (w>0){.b{y:1}}}",
    );
    assert.equal(
      cssify([
        { className: "a", properties: [{ name: "x", value: "0" }], media: "m", container: "(w>0)" },
        { className: "b", properties: [{ name: "y", value: "1" }], media: "n", container: "(w>0)" },
      ]),
      "@media m{@container (w>0){.a{x:0}}}@media n{@container (w>0){.b{y:1}}}",
    );

    assert.equal(
      cssify([
        { className: "a", properties: [{ name: "x", value: "0" }] },
        { className: "b", properties: [{ name: "y", value: "1" }], layer: "" },
      ]),
      "@layer{.b{y:1}}.a{x:0}",
    );
    assert.equal(
      cssify([
        { className: "a", properties: [{ name: "x", value: "0" }], layer: "" },
        { className: "b", properties: [{ name: "y", value: "1" }], layer: "" },
      ]),
      "@layer{.a{x:0}.b{y:1}}",
    );

    assert.equal(
      cssify([
        { className: "a", properties: [{ name: "x", value: "0" }], media: "p" },
        { className: "b", properties: [{ name: "y", value: "1" }], media: "p" },
        { className: "c", properties: [{ name: "z", value: "2" }], media: "p", layer: "" },
        { className: "d", properties: [{ name: "w", value: "3" }], media: "q", layer: "" },
        { className: "e", properties: [{ name: "a", value: "4" }], media: "q", layer: "" },
        { className: "f", properties: [{ name: "b", value: "5" }] },
      ]),
      ".f{b:5}@media p{@layer{.c{z:2}}.a{x:0}.b{y:1}}@media q{@layer{.e{a:4}.d{w:3}}}",
    );
  });

  it("selector", () => {
    assert.equal(cssify([{ className: "#a", properties: [{ name: "x", value: "0" }], selector: ":s" }]), ".\\#a:s{x:0}");
    assert.equal(cssify([{ className: "#a", properties: [{ name: "x", value: "0" }], selector: "&" }]), ".\\#a{x:0}");
    assert.equal(cssify([{ className: "#a", properties: [{ name: "x", value: "0" }], selector: "&+&" }]), ".\\#a+.\\#a{x:0}");
    assert.equal(cssify([{ className: "#a", properties: [{ name: "x", value: "0" }], selector: "p>&:q" }]), "p>.\\#a:q{x:0}");
    assert.equal(
      cssify([
        { className: "#a", properties: [{ name: "x", value: "0" }], selector: ":s" },
        { className: "#b", properties: [{ name: "x", value: "0" }], selector: ":t" },
        { className: "#c", properties: [{ name: "x", value: "0", important: true }], selector: ":u" },
        { className: "#d", properties: [{ name: "x", value: "0" }] },
      ]),
      ".\\#a:s,.\\#b:t,.\\#d{x:0}.\\#c:u{x:0!important}",
    );
  });

  it("pretty", () => {
    const pretty = classes => cssify(classes, { pretty: true });
    assert.equal(
      pretty([{ className: "a", properties: [{ name: "x", value: "0", important: false }] }]),
      `
.a{
  x:0
}
`.trimStart(),
    );
    assert.equal(
      pretty([
        {
          className: "a",
          properties: [
            { name: "x", value: "0", important: false },
            { name: "y", value: "1", important: false },
          ],
        },
      ]),
      `
.a{
  x:0;
  y:1
}
`.trimStart(),
    );
    assert.equal(
      pretty([
        { className: "a", properties: [{ name: "x", value: "0", important: false }], media: "m" },
        { className: "b", properties: [{ name: "y", value: "1", important: false }], media: "n" },
      ]),
      `
@media m{
  .a{
    x:0
  }
}

@media n{
  .b{
    y:1
  }
}
`.trimStart(),
    );
    assert.equal(
      pretty([
        { className: "a", properties: [{ name: "x", value: "0", important: false }], container: "(w<0)" },
        { className: "b", properties: [{ name: "y", value: "1", important: false }], container: "(w>0)" },
      ]),
      `
@container (w<0){
  .a{
    x:0
  }
}

@container (w>0){
  .b{
    y:1
  }
}
`.trimStart(),
    );
    assert.equal(
      pretty([
        { className: "a", properties: [{ name: "x", value: "0", important: false }], layer: "" },
        { className: "b", properties: [{ name: "y", value: "1", important: false }] },
      ]),
      `
@layer{
  .a{
    x:0
  }
}

.b{
  y:1
}
`.trimStart(),
    );
    assert.equal(
      pretty([{ className: "a", properties: [{ name: "x", value: "0", important: false }], media: "m", container: "(w>0)" }]),
      `
@media m{
  @container (w>0){
    .a{
      x:0
    }
  }
}
`.trimStart(),
    );
    assert.equal(
      pretty([{ className: "a", properties: [{ name: "x", value: "0", important: false }], media: "m", container: "(w>0)", layer: "" }]),
      `
@media m{
  @container (w>0){
    @layer{
      .a{
        x:0
      }
    }
  }
}
`.trimStart(),
    );
  });
});
