import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import resolve from "@rollup/plugin-node-resolve";
import sucrase from "@rollup/plugin-sucrase";
import { rollup } from "rollup";
import css from "rollup-plugin-import-css";
import isaaccssPlugin from "../lib/rollup/index.js";
import expected from "./sample/expected.css.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolvePath = (...segments) => path.resolve(__dirname, ...segments);

const input = resolvePath("sample/a.ts");
const plugins = [resolve({ extensions: [".js", ".jsx", ".ts", ".tsx"] }), sucrase({ production: true, transforms: ["jsx", "typescript"] })];

describe("rollup", () => {
  it("default config", async () => {
    assert.deepEqual(
      await rollup({ input, plugins: [isaaccssPlugin(), ...plugins] })
        .then(result => result.generate({ file: "a.js" }))
        .then(({ output }) => [output.length, output[1].fileName, output[1].source]),
      [2, "a.css", expected.default]
    );
  });

  it("default output filename is based on bundle filename", async () => {
    assert.deepEqual(
      await rollup({ input, plugins: [isaaccssPlugin(), ...plugins] })
        .then(result => result.generate({ file: "b.js" }))
        .then(({ output }) => [output.length, output[1].fileName, output[1].source]),
      [2, "b.css", expected.default]
    );
  });

  it("output filename can be specified", async () => {
    assert.deepEqual(
      await rollup({ input, plugins: [isaaccssPlugin({ output: "c.css" }), ...plugins] })
        .then(result => result.generate({ file: "a.js" }))
        .then(({ output }) => [output.length, output[1].fileName, output[1].source]),
      [2, "c.css", expected.default]
    );
  });

  it("bundle with other css", async () => {
    assert.deepEqual(
      await rollup({ input: resolvePath("sample/index.js"), plugins: [css(), isaaccssPlugin(), ...plugins] })
        .then(result => result.generate({ file: "a.js" }))
        .then(({ output }) => [output.length, output[1].fileName, output[1].source]),
      [2, "a.css", expected.reset + expected.default]
    );
  });

  it("bundle with other css, another output filename", async () => {
    assert.deepEqual(
      await rollup({ input: resolvePath("sample/index.js"), plugins: [css(), isaaccssPlugin({ output: "b.css" }), ...plugins] })
        .then(result => result.generate({ file: "a.js" }))
        .then(({ output }) => [output.length, output[1].fileName, output[1].source, output[2].fileName, output[2].source]),
      [3, "a.css", expected.reset, "b.css", expected.default]
    );
  });

  it("no replacements", async () => {
    assert.deepEqual(
      await rollup({ input, plugins: [isaaccssPlugin({ config: { replacements: [] } }), ...plugins] })
        .then(result => result.generate({}))
        .then(({ output }) => [output.length, output[1].fileName, output[1].source]),
      [2, "a.css", expected.noReplacements]
    );
  });

  it("include: a,b,c", async () => {
    assert.deepEqual(
      await rollup({ input, plugins: [isaaccssPlugin({ include: ["**/*.{js,ts,tsx}"] }), ...plugins] })
        .then(result => result.generate({}))
        .then(({ output }) => [output.length, output[1].fileName, output[1].source]),
      [2, "a.css", expected.abc]
    );
  });

  it("exclude: d", async () => {
    assert.deepEqual(
      await rollup({ input, plugins: [isaaccssPlugin({ exclude: ["**/*.jsx"] }), ...plugins] })
        .then(result => result.generate({}))
        .then(({ output }) => [output.length, output[1].fileName, output[1].source]),
      [2, "a.css", expected.abc]
    );
  });

  it("rollup cli", { only: true }, async () => {
    fs.rmSync(resolvePath(".dist/rollup/"), { force: true, recursive: true });
    execFileSync("npx", ["rollup", "-c"], { cwd: __dirname });
    assert.equal(fs.readFileSync(resolvePath(".dist/rollup/bundle.css"), "utf8"), expected.reset + expected.default);
  });
});
