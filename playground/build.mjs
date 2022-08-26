import esbuild from "esbuild";
import babel from "esbuild-plugin-babel";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";
import isaaccss from "../lib/esbuild/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolve = (...pathSegments) => path.resolve(__dirname, ...pathSegments);
const resolveOutput = (...pathSegments) => resolve("assets", ...pathSegments);

fs.rmSync(resolveOutput(), { recursive: true, force: true });

/** @type esbuild.BuildOptions */
const buildOptions = {
  entryPoints: [resolve("src/playground.tsx")],
  outfile: resolveOutput("playground.js"),
  bundle: true,
  minify: false,
  loader: { ".html": "text", ".otf": "copy" },
  assetNames: "[name]",
  inject: [isaaccss.inject],
  plugins: [
    isaaccss.plugin({
      filter: /\.tsx$/,
      config: { pretty: true },
    }),
    babel({
      filter: /\.[cm]?([jt])s(x?)$/,
      config: { presets: ["@babel/preset-typescript", "babel-preset-solid"] },
    }),
  ],
};

if (process.argv.includes("--serve")) {
  esbuild.serve({ servedir: "." }, buildOptions).then(({ port }) => console.log(`http://localhost:${port}`));
} else {
  esbuild.build(buildOptions);
}
