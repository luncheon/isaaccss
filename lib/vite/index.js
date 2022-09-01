import { cssify, parseTaggedTemplates } from "../index.node.js";
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
        const { filter, parserOptions, cssifyOptions } = resolveIsaaccssRollupPluginOptions(options);
        const cssMap = new Map();
        const virtualCssPrefix = "virtual:isaaccss:";
        const virtualCssSuffix = ".css";
        plugins.push({
            name: "isaaccss:serve",
            apply: "serve",
            resolveId: source => (source.startsWith(virtualCssPrefix) ? source : undefined),
            load: id => (id.startsWith(virtualCssPrefix) ? cssMap.get(id) : undefined),
            transform(code, id) {
                if (id.startsWith(virtualCssPrefix) || !filter(id)) {
                    return;
                }
                const [classes, invalidClasses] = parseTaggedTemplates(code, parserOptions);
                const css = cssify(classes.values(), cssifyOptions);
                if (css) {
                    const virtualCss = virtualCssPrefix + id + virtualCssSuffix;
                    cssMap.set(virtualCss, css);
                    return `import "${virtualCss}";${code}`;
                }
                invalidClasses.forEach((nodes, className) => {
                    const start = nodes[0].loc?.start;
                    console.warn(`isaaccss: ${id}${start ? `:${start.line}` : ""} - Couldn't parse class "${className}".`);
                });
            },
        });
    }
    return plugins;
};
export default isaaccssVitePlugin;
