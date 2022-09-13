import esbuild from "esbuild";
import babel from "esbuild-plugin-babel";
import pipe from "esbuild-plugin-pipe";
import isaaccss from "isaaccss/esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolve = (...pathSegments) => path.resolve(__dirname, ...pathSegments);
const resolveOutput = (...pathSegments) => resolve("assets", ...pathSegments);

fs.rmSync(resolveOutput(), { recursive: true, force: true });

await esbuild.build({
  entryPoints: {
    "editor.worker": resolve("node_modules/monaco-editor/esm/vs/editor/editor.worker.js"),
    "css.worker": resolve("node_modules/monaco-editor/esm/vs/language/css/css.worker.js"),
    "ts.worker": resolve("node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js"),
  },
  outdir: resolveOutput(),
  assetNames: "[name]",
  chunkNames: "[name]",
  loader: { ".ttf": "file" },
  bundle: true,
  minify: true,
  format: "iife",
});

const isaaccssInstance = isaaccss.plugin();

/** @type esbuild.BuildOptions */
const buildOptions = {
  entryPoints: [resolve("src/index.tsx")],
  outfile: resolveOutput("playground.js"),
  bundle: true,
  minify: true,
  loader: { ".otf": "copy", ".ttf": "copy" },
  assetNames: "[name]",
  inject: [isaaccss.inject],
  define: { "process.env.BABEL_TYPES_8_BREAKING": false, "process.platform": "''", "Buffer.isBuffer": "Function" },
  plugins: [
    pipe({
      filter: /\.tsx$/,
      plugins: [isaaccssInstance, babel({ config: { presets: ["@babel/preset-typescript", "babel-preset-solid"] } })],
    }),
    isaaccssInstance,
  ],
};

if (process.argv.includes("--serve")) {
  esbuild.serve({ servedir: "." }, buildOptions).then(({ port }) => console.log(`http://localhost:${port}`));
} else {
  esbuild.build(buildOptions);
}
