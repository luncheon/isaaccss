import assert from "assert/strict";
import esbuild from "esbuild";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import isaaccss from "../lib/esbuild/index.js";
import expected from "./sample/expected.css.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolve = (...segments) => path.resolve(__dirname, ...segments);

const build = options =>
  esbuild
    .build({
      entryPoints: [resolve("sample/index.js")],
      outdir: resolve("dist"),
      bundle: true,
      minify: true,
      inject: [isaaccss.inject],
      plugins: [isaaccss.plugin(options)],
      write: false,
    })
    .then(result => result.outputFiles[1].text.trimEnd());

describe("esbuild", () => {
  it("default config", async () => assert.equal(await build(), expected.default + expected.reset));
  it("no replacements", async () => assert.equal(await build({ config: { replacements: [] } }), expected.noReplacements + expected.reset));
  it("a,b,c", async () => assert.equal(await build({ filter: /\.(js|tsx?)$/ }), expected.abc + expected.reset));
});
