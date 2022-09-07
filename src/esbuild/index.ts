import type { OnLoadArgs, OnLoadResult, Plugin, PluginBuild } from "esbuild";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { AcceptedPlugin } from "postcss";
import { applyPostcss } from "../applyPostcss.js";
import { Aliases, cssify, CssifyOptions, defaultAliases, Style, transform, TransformOptions } from "../index.node.js";

const inject = createRequire(import.meta.url).resolve("./inject.js");

export interface IsaaccssEsbuildPluginOptions extends CssifyOptions {
  readonly filter?: RegExp;
  readonly compress?: boolean | { readonly prefix?: string };
  readonly aliases?: Aliases | readonly Aliases[];
  readonly postcss?: { readonly plugins?: AcceptedPlugin[] };
}

interface EsbuildPipeablePlugin extends Plugin {
  setup(build: PluginBuild, pipe: { transform: { args: OnLoadArgs; contents: string } }): OnLoadResult | undefined;
  setup(build: PluginBuild): void;
}

const pathToLoader = (path: string) =>
  `${path.endsWith("ts") || path.endsWith("tsx") ? "t" : "j"}s${path.endsWith("x") ? "x" : ""}` as const;
const pathToBabelParserPlugin = (path: string) => [
  ...(path.endsWith("ts") || path.endsWith("tsx") ? ["typescript" as const] : []),
  ...(path.endsWith("x") ? ["jsx" as const] : []),
];

const plugin = (options?: IsaaccssEsbuildPluginOptions): EsbuildPipeablePlugin => {
  const filter = options?.filter ?? /\.[cm]?[jt]sx?$/;
  const transformOptions: TransformOptions = {
    compress: options?.compress,
    aliases: options?.aliases ?? defaultAliases,
  };
  const transformedCodeMap = new Map<string, string>();
  return {
    name: "isaaccss",
    setup(build: PluginBuild, pipe?: { transform: { args: OnLoadArgs; contents: string } }) {
      if (pipe?.transform) {
        const path = pipe.transform.args.path;
        return { contents: transformedCodeMap.get(path) ?? pipe.transform.contents, loader: pathToLoader(path) };
      }

      const virtualFilter = /^virtual:isaaccss\.css$/;
      const virtualNamespace = "virtual:isaaccss:css";

      let css: string | undefined;
      build.onStart(async () => {
        transformedCodeMap.clear();
        const classes = new Map<string, Style>();
        const promises: Promise<unknown>[] = [];
        const load = async (path: string) => {
          const code = await fs.readFile(path, "utf8");
          const transformed = transform(code, path, transformOptions, pathToBabelParserPlugin(path), classes);
          transformedCodeMap.set(path, transformed.code);
        };
        const plugin: Plugin = {
          name: "isaaccss:prebuild",
          setup: build => {
            build.onLoad({ filter }, ({ path }) => void promises.push(load(path)));
            build.onResolve({ filter: virtualFilter }, ({ path }) => ({ path, namespace: virtualNamespace }));
            build.onLoad({ filter: virtualFilter, namespace: virtualNamespace }, () => ({ contents: "", loader: "js" }));
          },
        };
        await build.esbuild.build({ ...build.initialOptions, plugins: [plugin], write: false, sourcemap: false, logLevel: "error" });
        await Promise.all(promises);
        css = await applyPostcss(cssify(classes.values(), options), options?.postcss);
      });

      build.onLoad({ filter }, async ({ path }) => ({
        contents: transformedCodeMap.get(path) ?? (await fs.readFile(path, "utf8")),
        loader: pathToLoader(path),
      }));
      build.onResolve({ filter: virtualFilter }, ({ path }) => ({ path, namespace: virtualNamespace }));
      build.onLoad({ filter: virtualFilter, namespace: virtualNamespace }, () => ({ contents: css, loader: "css" }));
    },
  };
};

export default { inject, plugin };
