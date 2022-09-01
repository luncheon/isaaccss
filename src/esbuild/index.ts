import type { Plugin } from "esbuild";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import {
  cssify,
  CssOptions,
  defaultReplacements,
  mergeReplacements,
  ParserOptions,
  parseTaggedTemplates,
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
  if (match) {
    const babelParserPlugins = [...(match[2] ? ["jsx" as const] : []), ...(match[1] === "t" ? ["typescript" as const] : [])];
    const [, invalidClasses] = parseTaggedTemplates(await fs.readFile(filename, "utf8"), options, babelParserPlugins, classes);
    invalidClasses.forEach((nodes, className) => {
      const start = nodes[0].loc?.start;
      console.warn(`isaaccss: ${filename}${start ? `:${start.line}` : ""} - Couldn't parse class "${className}".`);
    });
  }
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
        css = cssify(classes.values(), options?.config);
      });

      build.onResolve({ filter: virtualFilter }, ({ path }) => ({ path, namespace: virtualNamespace }));
      build.onLoad({ filter: virtualFilter, namespace: virtualNamespace }, () => ({ contents: css, loader: "css" }));
    },
  };
};

export default { inject, plugin };
