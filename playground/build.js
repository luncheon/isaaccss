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

const isaaccssInstance = isaaccss.plugin();

/** @type esbuild.BuildOptions */
const buildOptions = {
  entryPoints: [resolve("src/index.tsx")],
  outfile: resolveOutput("playground.js"),
  bundle: true,
  minify: true,
  loader: { ".otf": "copy" },
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
  fs.rmSync(resolveOutput(), { recursive: true, force: true });
  esbuild.build(buildOptions);
}
