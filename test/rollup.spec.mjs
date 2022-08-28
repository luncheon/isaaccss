import resolve from "@rollup/plugin-node-resolve";
import sucrase from "@rollup/plugin-sucrase";
import assert from "assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { rollup } from "rollup";
import isaaccssPlugin from "../lib/rollup/index.js";
import expected from "./sample/e.css.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolvePath = (...segments) => path.resolve(__dirname, ...segments);

const input = resolvePath("sample/a.ts");
const plugins = [resolve({ extensions: [".js", ".jsx", ".ts", ".tsx"] }), sucrase({ production: true, transforms: ["jsx", "typescript"] })];

describe("rollup", () => {
  it("default config", async () => {
    assert.deepEqual(
      await rollup({ input, plugins: [isaaccssPlugin(), ...plugins] })
        .then(result => result.generate({}))
        .then(({ output }) => [output[1].fileName, output[1].source]),
      ["a.css", expected.default]
    );
  });

  it("default output filename is based on bundle filename", async () => {
    assert.deepEqual(
      await rollup({ input, plugins: [isaaccssPlugin(), ...plugins] })
        .then(result => result.generate({ file: "b.js" }))
        .then(({ output }) => [output[1].fileName, output[1].source]),
      ["b.css", expected.default]
    );
  });

  it("output filename can be specified", async () => {
    assert.deepEqual(
      await rollup({ input, plugins: [isaaccssPlugin({ output: "c.css" }), ...plugins] })
        .then(result => result.generate({}))
        .then(({ output }) => [output[1].fileName, output[1].source]),
      ["c.css", expected.default]
    );
  });

  it("no replacements", async () => {
    assert.deepEqual(
      await rollup({ input, plugins: [isaaccssPlugin({ config: { replacements: [] } }), ...plugins] })
        .then(result => result.generate({}))
        .then(({ output }) => [output[1].fileName, output[1].source]),
      ["a.css", expected.noReplacements]
    );
  });

  it("include: a,b,c", async () => {
    assert.deepEqual(
      await rollup({ input, plugins: [isaaccssPlugin({ include: ["**/*.{js,ts,tsx}"] }), ...plugins] })
        .then(result => result.generate({}))
        .then(({ output }) => [output[1].fileName, output[1].source]),
      ["a.css", expected.abc]
    );
  });

  it("exclude: d", async () => {
    assert.deepEqual(
      await rollup({ input, plugins: [isaaccssPlugin({ exclude: ["**/*.jsx"] }), ...plugins] })
        .then(result => result.generate({}))
        .then(({ output }) => [output[1].fileName, output[1].source]),
      ["a.css", expected.abc]
    );
  });
});
