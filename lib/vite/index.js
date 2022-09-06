import { applyPostcss } from "../applyPostcss.js";
import { cssify, transform } from "../index.node.js";
import isaaccssRollupPlugin, { resolveIsaaccssRollupPluginOptions } from "../rollup/index.js";
const isaaccssVitePlugin = (options) => {
    const plugins = [];
    {
        const rollupPlugin = isaaccssRollupPlugin(options);
        plugins.push({
            name: "isaaccss:build",
            apply: "build",
            transform: rollupPlugin.transform.handler,
            generateBundle: rollupPlugin.generateBundle.handler,
        });
    }
    {
        const { filter, transformOptions, cssifyOptions } = resolveIsaaccssRollupPluginOptions(options);
        const cssMap = new Map();
        const virtualCssPrefix = "virtual:isaaccss:";
        const virtualCssSuffix = ".css";
        plugins.push({
            name: "isaaccss:serve",
            apply: "serve",
            resolveId: source => (source.startsWith(virtualCssPrefix) ? source : undefined),
            load: id => (id.startsWith(virtualCssPrefix) ? cssMap.get(id) : undefined),
            async transform(code, id) {
                if (id.startsWith(virtualCssPrefix) || !filter(id)) {
                    return;
                }
                const result = transform(code, id, { ...transformOptions, compress: false });
                const css = await applyPostcss(cssify(result.classes.values(), cssifyOptions), options?.postcss);
                if (css) {
                    const virtualCss = virtualCssPrefix + id + virtualCssSuffix;
                    cssMap.set(virtualCss, css);
                    return `import "${virtualCss}";${result.code}`;
                }
            },
        });
    }
    return plugins;
};
export default isaaccssVitePlugin;
