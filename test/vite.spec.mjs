import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { build } from "vite";
import isaaccssPlugin from "../lib/vite/index.js";
import expected from "./sample/expected.css.mjs";
import viteConfig from "./vite.config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolvePath = (...segments) => path.resolve(__dirname, ...segments);

describe("vite", () => {
  it("default config", async () => {
    const built = await build({ ...viteConfig, plugins: [isaaccssPlugin()] });
    assert.equal(built.output.find(o => o.fileName === "index.css")?.source, expected.reset + "\n" + expected.default);
  });

  it("bundle with other css, another output filename", async () => {
    const built = await build({ ...viteConfig, plugins: [isaaccssPlugin({ output: "a.css" })] });
    assert.equal(built.output.find(o => o.fileName === "index.css")?.source.trim(), expected.reset);
    assert.equal(built.output.find(o => o.fileName === "a.css")?.source.trim(), expected.default);
  });

  it("no replacements", async () => {
    const built = await build({ ...viteConfig, plugins: [isaaccssPlugin({ config: { replacements: [] } })] });
    assert.equal(built.output.find(o => o.fileName === "index.css")?.source, expected.reset + "\n" + expected.noReplacements);
  });

  it("a,b,c", async () => {
    const built = await build({ ...viteConfig, plugins: [isaaccssPlugin({ include: ["**/*.{js,ts,tsx}"] })] });
    assert.equal(built.output.find(o => o.fileName === "index.css")?.source, expected.reset + "\n" + expected.abc);
  });

  it("exclude: d", async () => {
    const built = await build({ ...viteConfig, plugins: [isaaccssPlugin({ exclude: ["**/*.jsx"] })] });
    assert.equal(built.output.find(o => o.fileName === "index.css")?.source, expected.reset + "\n" + expected.abc);
  });

  it("vite cli", async () => {
    execFileSync("npx", ["vite", "build"], { cwd: __dirname });
    assert.equal(fs.readFileSync(resolvePath(".dist/vite/index.css"), "utf8"), expected.reset + "\n" + expected.default);
  });
});
