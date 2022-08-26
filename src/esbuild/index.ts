import type { Plugin } from "esbuild";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import {
  cssify,
  CssOptions,
  defaultReplacements,
  mergeReplacements,
  ParserOptions,
  parseScript,
  Replacements,
  Style,
} from "../index.node.js";

const inject = createRequire(import.meta.url).resolve("./inject.js");

interface IsaaccssEsbuildPluginOptions {
  readonly filter?: RegExp;
  readonly config?: CssOptions & {
    readonly replacements?: Replacements | readonly Replacements[];
  };
}

const parseFile = async (filename: string, options: ParserOptions, classes: Map<string, Style>) => {
  const match = filename.match(/\.[cm]?([jt])s(x?)$/);
  match && parseScript(await fs.readFile(filename, "utf8"), options, { jsx: !!match[2], typescript: match[1] === "t" }, classes);
};

const plugin = (options?: IsaaccssEsbuildPluginOptions): Plugin => {
  const parserOptions: ParserOptions = {
    replacements: options?.config?.replacements ? mergeReplacements(options?.config?.replacements) : defaultReplacements,
  };
  return {
    name: "isaaccss",
    setup: async build => {
      const virtualFilter = /^virtual:isaaccss\.css$/;
      const virtualNamespace = "virtual:isaaccss:css";

      let css: string | undefined;
      build.onStart(async () => {
        const classes = new Map<string, Style>();
        const promises: Promise<void>[] = [];
        const resolving = Symbol();
        const plugin: Plugin = {
          name: "isaaccss:prebuild",
          setup: build => {
            build.onResolve({ filter: /.*/ }, async ({ path, ...args }) => {
              if (args.pluginData !== resolving) {
                const resolved = await build.resolve(path, { ...args, pluginData: resolving });
                if (resolved.errors.length === 0 && (!options?.filter || options.filter.test(resolved.path))) {
                  promises.push(parseFile(resolved.path, parserOptions, classes));
                }
              }
              return undefined;
            });
            build.onResolve({ filter: virtualFilter }, ({ path }) => ({ path, namespace: virtualNamespace }));
            build.onLoad({ filter: virtualFilter, namespace: virtualNamespace }, () => ({ contents: "", loader: "js" }));
          },
        };

        await build.esbuild.build({
          ...build.initialOptions,
          plugins: [plugin],
          write: false,
          sourcemap: false,
        });
        await Promise.all(promises);
        css = cssify(classes, options?.config);
      });

      build.onResolve({ filter: virtualFilter }, ({ path }) => ({ path, namespace: virtualNamespace }));
      build.onLoad({ filter: virtualFilter, namespace: virtualNamespace }, () => ({ contents: css, loader: "css" }));
    },
  };
};

export default { inject, plugin };
