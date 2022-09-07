import { createFilter } from "@rollup/pluginutils";
import { defaultAliases } from "./aliases/default.js";
import { cssify, postcssify, transform } from "./api/index.js";
export const resolveIsaaccssRollupPluginOptions = (options) => ({
    filter: createFilter(options?.include ?? "**/*.{js,cjs,mjs,jsx,cjsx,mjsx,ts,cts,mts,tsx,ctsx,mtsx}", options?.exclude ?? "**/node_modules/**"),
    transformOptions: {
        compress: options?.compress,
        aliases: options?.aliases ?? defaultAliases,
    },
    cssifyOptions: options,
});
const isaaccssRollupPlugin = (options) => {
    const { filter, transformOptions, cssifyOptions } = resolveIsaaccssRollupPluginOptions(options);
    const classes = new Map();
    return {
        name: "isaaccss",
        transform: {
            order: "post",
            handler(code, id) {
                if (filter(id)) {
                    return transform(code, id, transformOptions, undefined, classes).code;
                }
            },
        },
        generateBundle: {
            order: "post",
            async handler(_, bundle) {
                const fileName = options?.output ||
                    Object.entries(bundle)
                        .find(([, item]) => item.type === "chunk" && item.isEntry)?.[0]
                        .replace(/\.[cm]?jsx?$/, "")
                        .concat(".css");
                const source = await postcssify(cssify(classes.values(), cssifyOptions), options?.postcss);
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
