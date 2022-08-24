import esbuild from "esbuild";
import babel from "esbuild-plugin-babel";
import pipe from "esbuild-plugin-pipe";
import fs from "node:fs";
import path from "node:path";
import open from "open";
import { fileURLToPath } from "url";
import isaaccss from "../lib/esbuild.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolve = (...pathSegments) => path.resolve(__dirname, ...pathSegments);
const resolveOutput = (...pathSegments) => resolve("assets", ...pathSegments);

const watch = process.argv.includes("-w");
const isaaccssInstance = isaaccss({ output: { filename: resolveOutput("playground.css"), append: true } });

fs.rmSync(resolveOutput(), { recursive: true, force: true });

esbuild
  .build({
    entryPoints: [resolve("src/playground.tsx")],
    outfile: resolveOutput("playground.js"),
    bundle: true,
    minify: true,
    loader: { ".html": "text", ".otf": "copy" },
    assetNames: "[name]",
    plugins: [
      isaaccssInstance,
      pipe({
        filter: /\.tsx$/,
        plugins: [isaaccssInstance, babel({ config: { presets: ["@babel/preset-typescript", "babel-preset-solid"] } })],
      }),
    ],
    watch,
  })
  .then(() => watch && open("index.html"));
