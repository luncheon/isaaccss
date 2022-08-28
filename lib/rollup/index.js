import { createFilter } from "@rollup/pluginutils";
import { simple as walkAst } from "acorn-walk";
import { cssify, defaultReplacements, mergeReplacements, parseClass, } from "../index.node.js";
const isaaccssRollupPlugin = (options) => {
    const parserOptions = {
        replacements: options?.config?.replacements ? mergeReplacements(options?.config?.replacements) : defaultReplacements,
    };
    const cssifyOptions = options?.config;
    const classes = new Map();
    const filter = createFilter(options?.include, options?.exclude);
    return {
        name: "isaaccss",
        moduleParsed(moduleInfo) {
            if (!filter(moduleInfo.id) || !moduleInfo.ast) {
                return;
            }
            walkAst(moduleInfo.ast, {
                Literal: node => parseClass(node.value, parserOptions, classes),
                TemplateElement: node => parseClass(node.value.cooked, parserOptions, classes),
            });
        },
        generateBundle(_, bundle) {
            const fileName = options?.output ||
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
                }
                else {
                    throw Error(`isaaccss: can't output to script file "${fileName}"`);
                }
            }
            else {
                this.emitFile({ type: "asset", fileName: fileName, source: css });
            }
        },
    };
};
export default isaaccssRollupPlugin;
