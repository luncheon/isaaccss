import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import isaaccssPlugin from "isaaccss/vite";
import OpenProps from "open-props";
import postcssJitProps from "postcss-jit-props";
import { build } from "vite";
import expected from "./sample/expected.css.js";
import viteConfig from "./vite.config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolvePath = (...segments) => path.resolve(__dirname, ...segments);

describe("vite", () => {
  it("default config", async () => {
    const built = await build({ ...viteConfig, plugins: [isaaccssPlugin({ compress: false })] });
    assert.equal(built.output.find(o => o.fileName === "index.css")?.source, expected.reset + "\n" + expected.default);
  });

  it("bundle with other css, another output filename", async () => {
    const built = await build({ ...viteConfig, plugins: [isaaccssPlugin({ compress: false, output: "a.css" })] });
    assert.equal(built.output.find(o => o.fileName === "index.css")?.source.trim(), expected.reset);
    assert.equal(built.output.find(o => o.fileName === "a.css")?.source.trim(), expected.default);
  });

  it("no aliases", async () => {
    const built = await build({ ...viteConfig, plugins: [isaaccssPlugin({ compress: false, aliases: [] })] });
    assert.equal(built.output.find(o => o.fileName === "index.css")?.source, expected.reset + "\n" + expected.noAliases);
  });

  it("open props", async () => {
    const built = await build({ ...viteConfig, plugins: [isaaccssPlugin({ compress: false, postcss: { plugins: [postcssJitProps(OpenProps)] } })] });
    assert.equal(built.output.find(o => o.fileName === "index.css")?.source, expected.reset + "\n" + expected.openProps);
  });

  it("a,b,c", async () => {
    const built = await build({ ...viteConfig, plugins: [isaaccssPlugin({ compress: false, include: ["**/*.{js,ts,tsx}"] })] });
    assert.equal(built.output.find(o => o.fileName === "index.css")?.source, expected.reset + "\n" + expected.abc);
  });

  it("exclude: d", async () => {
    const built = await build({ ...viteConfig, plugins: [isaaccssPlugin({ compress: false, exclude: ["**/*.jsx"] })] });
    assert.equal(built.output.find(o => o.fileName === "index.css")?.source, expected.reset + "\n" + expected.abc);
  });

  it("vite cli", async () => {
    execFileSync("npx", ["vite", "build"], { cwd: __dirname });
    assert.equal(fs.readFileSync(resolvePath(".dist/vite/index.css"), "utf8"), expected.reset + "\n" + expected.default);
  });
});
