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
        buildStart() {
            classes.clear();
        },
        moduleParsed(moduleInfo) {
            if (filter(moduleInfo.id) && moduleInfo.ast) {
                walkAst(moduleInfo.ast, {
                    Literal: node => parseClass(node.value, parserOptions, classes),
                    TemplateElement: node => parseClass(node.value.cooked, parserOptions, classes),
                });
            }
        },
        generateBundle: {
            order: "post",
            handler(_, bundle) {
                const fileName = options?.output ||
                    Object.entries(bundle)
                        .find(([, item]) => item.type === "chunk" && item.isEntry)?.[0]
                        .replace(/\.[cm]?jsx?$/, "")
                        .concat(".css");
                const source = cssify(classes, cssifyOptions);
                if (!fileName) {
                    console.log(source);
                    return;
                }
                const bundledCss = bundle[fileName];
                if (bundledCss) {
                    if (bundledCss.type === "asset") {
                        bundledCss.source += source;
                    }
                    else {
                        throw Error(`isaaccss: can't output to script file "${fileName}"`);
                    }
                }
                else {
                    this.emitFile({ type: "asset", fileName, source });
                }
            },
        },
    };
};
export default isaaccssRollupPlugin;
