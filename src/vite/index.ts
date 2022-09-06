import type { Plugin } from "vite";
import { applyPostcss } from "../applyPostcss.js";
import { cssify, transformTaggedTemplates } from "../index.node.js";
import isaaccssRollupPlugin, { IsaaccssRollupPluginOptions, resolveIsaaccssRollupPluginOptions } from "../rollup/index.js";

export interface IsaaccssVitePluginOptions extends IsaaccssRollupPluginOptions {}

const isaaccssVitePlugin = (options?: IsaaccssVitePluginOptions): Plugin[] => {
  const plugins: Plugin[] = [];
  {
    const rollupPlugin = isaaccssRollupPlugin(options);
    plugins.push({
      name: "isaaccss:build",
      apply: "build",
      transform: (rollupPlugin.transform as { handler: Plugin["transform"] }).handler,
      generateBundle: (rollupPlugin.generateBundle as { handler: Plugin["generateBundle"] }).handler,
    });
  }
  {
    const { filter, transformOptions, cssifyOptions } = resolveIsaaccssRollupPluginOptions(options);
    const cssMap = new Map<string, string>();
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
        const result = transformTaggedTemplates(code, id, transformOptions);
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
