import { createFilter, FilterPattern } from "@rollup/pluginutils";
import { AcceptedPlugin } from "postcss";
import type { Plugin } from "rollup";
import { applyPostcss } from "../applyPostcss.js";
import {
  cssify,
  CssOptions,
  defaultReplacements,
  mergeReplacements,
  Replacements,
  Style,
  transformTaggedTemplates,
} from "../index.node.js";

export interface IsaaccssRollupPluginOptions extends CssOptions {
  readonly include: FilterPattern;
  readonly exclude: FilterPattern;
  readonly output?: string;
  readonly compress?: boolean;
  readonly replacements?: Replacements | readonly Replacements[];
  readonly postcss?: { readonly plugins?: AcceptedPlugin[] };
}

export const resolveIsaaccssRollupPluginOptions = (options?: IsaaccssRollupPluginOptions) => ({
  filter: createFilter(
    options?.include ?? "**/*.{js,cjs,mjs,jsx,cjsx,mjsx,ts,cts,mts,tsx,ctsx,mtsx}",
    options?.exclude ?? "**/node_modules/**",
  ),
  transformOptions: {
    compress: options?.compress,
    replacements: options?.replacements ? mergeReplacements(options?.replacements) : defaultReplacements,
  },
  cssifyOptions: options,
});

const isaaccssRollupPlugin = (options?: IsaaccssRollupPluginOptions): Plugin => {
  const { filter, transformOptions, cssifyOptions } = resolveIsaaccssRollupPluginOptions(options);
  const classes = new Map<string, Style>();
  return {
    name: "isaaccss",
    transform: {
      order: "post",
      handler(code, id) {
        if (filter(id)) {
          return transformTaggedTemplates(code, id, transformOptions, undefined, classes).code;
        }
      },
    },
    generateBundle: {
      order: "post",
      async handler(_, bundle) {
        const fileName =
          options?.output ||
          Object.entries(bundle)
            .find(([, item]) => item.type === "chunk" && item.isEntry)?.[0]
            .replace(/\.[cm]?jsx?$/, "")
            .concat(".css");
        const source = await applyPostcss(cssify(classes.values(), cssifyOptions), options?.postcss);
        if (!fileName) {
          console.log(source);
          return;
        }
        const bundledCss = bundle[fileName];
        if (bundledCss) {
          if (bundledCss.type === "asset") {
            bundledCss.source += source;
          } else {
            throw Error(`isaaccss: can't output to script file "${fileName}"`);
          }
        } else {
          this.emitFile({ type: "asset", fileName, source });
        }
      },
    },
  };
};

export default isaaccssRollupPlugin;
