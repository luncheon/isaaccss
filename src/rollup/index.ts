import { createFilter, FilterPattern } from "@rollup/pluginutils";
import { simple as walkAst } from "acorn-walk";
import type { Plugin } from "rollup";
import {
  cssify,
  CssOptions,
  defaultReplacements,
  mergeReplacements,
  parseClass,
  ParserOptions,
  Replacements,
  Style,
} from "../index.node.js";

export interface IsaaccssRollupPluginOptions {
  readonly include: FilterPattern;
  readonly exclude: FilterPattern;
  readonly output?: string;
  readonly config?: CssOptions & {
    readonly replacements?: Replacements | readonly Replacements[];
  };
}

const isaaccssRollupPlugin = (options?: IsaaccssRollupPluginOptions): Plugin => {
  const parserOptions: ParserOptions = {
    replacements: options?.config?.replacements ? mergeReplacements(options?.config?.replacements) : defaultReplacements,
  };
  const cssifyOptions = options?.config;
  const classes = new Map<string, Style>();
  const filter = createFilter(options?.include, options?.exclude);
  return {
    name: "isaaccss",
    buildStart() {
      classes.clear();
    },
    moduleParsed(moduleInfo) {
      if (!filter(moduleInfo.id) || !moduleInfo.ast) {
        return;
      }
      walkAst(moduleInfo.ast, {
        Literal: node => parseClass(node.value, parserOptions, classes),
        TemplateElement: node => parseClass(node.value.cooked, parserOptions, classes),
      });
    },
    generateBundle: {
      order: "post",
      handler(_, bundle) {
        const fileName =
          options?.output ||
          Object.entries(bundle)
            .find(([, item]) => item.type === "chunk" && item.isEntry)?.[0]
            .replace(/\.[cm]?jsx?$/, "")
            .concat(".css");
        const css = cssify(classes, cssifyOptions);
        if (!fileName) {
          console.log(css);
          return;
        }
        const bundledCss = bundle[fileName];
        if (bundledCss) {
          if (bundledCss.type === "asset") {
            bundledCss.source += css;
          } else {
            throw Error(`isaaccss: can't output to script file "${fileName}"`);
          }
        } else {
          this.emitFile({ type: "asset", fileName: fileName, source: css });
        }
      },
    },
  };
};

export default isaaccssRollupPlugin;
