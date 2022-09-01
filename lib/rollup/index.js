import { createFilter } from "@rollup/pluginutils";
import { cssify, defaultReplacements, mergeReplacements, parseTaggedTemplates } from "../index.node.js";
export const resolveIsaaccssRollupPluginOptions = (options) => ({
    filter: createFilter(options?.include ?? "**/*.{js,cjs,mjs,jsx,cjsx,mjsx,ts,cts,mts,tsx,ctsx,mtsx}", options?.exclude ?? "**/node_modules/**"),
    parserOptions: {
        replacements: options?.config?.replacements ? mergeReplacements(options?.config?.replacements) : defaultReplacements,
    },
    cssifyOptions: options?.config,
});
const isaaccssRollupPlugin = (options) => {
    const { filter, parserOptions, cssifyOptions } = resolveIsaaccssRollupPluginOptions(options);
    const classes = new Map();
    return {
        name: "isaaccss",
        transform: {
            order: "post",
            handler(code, id) {
                if (filter(id)) {
                    const [, invalidClasses] = parseTaggedTemplates(code, parserOptions, undefined, classes);
                    invalidClasses.forEach((nodes, className) => {
                        const start = nodes[0].loc?.start;
                        console.warn(`isaaccss: ${id}${start ? `:${start.line}` : ""} - Couldn't parse class "${className}".`);
                    });
                }
            },
        },
        generateBundle: {
            order: "post",
            handler(_, bundle) {
                const fileName = options?.output ||
                    Object.entries(bundle)
                        .find(([, item]) => item.type === "chunk" && item.isEntry)?.[0]
                        .replace(/\.[cm]?jsx?$/, "")
                        .concat(".css");
                const source = cssify(classes.values(), cssifyOptions);
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
