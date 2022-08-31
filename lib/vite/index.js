import { createFilter } from "@rollup/pluginutils";
import { cssify, defaultReplacements, mergeReplacements, parseScript } from "../index.node.js";
import isaaccssRollupPlugin from "../rollup/index.js";
const isaaccssVitePlugin = (options) => {
    const plugins = [];
    {
        const rollupPlugin = isaaccssRollupPlugin(options);
        plugins.push({
            name: "isaaccss:build",
            apply: "build",
            moduleParsed: rollupPlugin.moduleParsed,
            generateBundle: rollupPlugin.generateBundle.handler,
        });
    }
    {
        const filter = createFilter(options?.include ?? "**/*.{js,cjs,mjs,jsx,cjsx,mjsx,ts,cts,mts,tsx,ctsx,mtsx}", options?.exclude ?? "**/node_modules/**");
        const parserOptions = {
            replacements: options?.config?.replacements ? mergeReplacements(options?.config?.replacements) : defaultReplacements,
        };
        const cssMap = new Map();
        const virtualCssPrefix = "virtual:isaaccss:";
        const virtualCssSuffix = ".css";
        plugins.push({
            name: "isaaccss:serve",
            apply: "serve",
            resolveId(source) {
                if (source.startsWith(virtualCssPrefix)) {
                    return source;
                }
            },
            load(id) {
                if (id.startsWith(virtualCssPrefix)) {
                    return cssMap.get(id);
                }
            },
            transform(code, id) {
                if (!id.startsWith(virtualCssPrefix) && filter(id)) {
                    const css = cssify(parseScript(code, parserOptions), options?.config);
                    if (css) {
                        const virtualCss = virtualCssPrefix + id + virtualCssSuffix;
                        cssMap.set(virtualCss, css);
                        return `import "${virtualCss}";${code}`;
                    }
                }
            },
        });
    }
    return plugins;
};
export default isaaccssVitePlugin;
