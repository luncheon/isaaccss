import assert from "assert/strict";
import esbuild from "esbuild";
import isaaccss from "isaaccss/esbuild";
import path from "node:path";
import { it } from "node:test";
import { fileURLToPath } from "node:url";
import OpenProps from "open-props";
import postcssJitProps from "postcss-jit-props";
import expected from "./sample/expected.css.js";

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

it("esbuild", async () => {
  assert.equal(await build({ compress: false }), expected.default + expected.reset);
  assert.equal(await build({ compress: false, aliases: [] }), expected.noAliases + expected.reset);
  assert.equal(await build({ compress: false, postcss: { plugins: [postcssJitProps(OpenProps)] } }), expected.openProps + expected.reset);
  assert.equal(await build({ compress: false, filter: /\.(js|tsx?)$/ }), expected.abc + expected.reset);
});
