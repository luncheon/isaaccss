import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { cssify, defaultReplacements, parseScript } from "../index.node.js";
const inject = createRequire(import.meta.url).resolve("./inject.js");
const parseFile = async (filename, options, classes) => {
    const match = filename.match(/\.[cm]?([jt])s(x?)$/);
    match && parseScript(await fs.readFile(filename, "utf8"), options, { jsx: !!match[2], typescript: match[1] === "t" }, classes);
};
const plugin = (options) => {
    const pluginName = "isaaccss";
    const config = { replacements: options?.config?.replacements ?? defaultReplacements, pretty: options?.config?.pretty };
    return {
        name: pluginName,
        setup: async (build) => {
            const virtualFilter = /^isaaccss:css$/;
            const virtualNamespace = "isaaccss:css";
            let css;
            build.onStart(async () => {
                const classes = new Map();
                const promises = [];
                const resolving = Symbol();
                const plugin = {
                    name: "isaaccss:prebuild",
                    setup: build => {
                        build.onResolve({ filter: /.*/ }, async ({ path, ...args }) => {
                            if (args.pluginData !== resolving) {
                                const resolved = await build.resolve(path, { ...args, pluginData: resolving });
                                if (resolved.errors.length === 0 && (!options?.filter || options.filter.test(resolved.path))) {
                                    promises.push(parseFile(resolved.path, config, classes));
                                }
                            }
                            return undefined;
                        });
                        build.onResolve({ filter: virtualFilter }, ({ path }) => ({ path, namespace: virtualNamespace }));
                        build.onLoad({ filter: virtualFilter, namespace: virtualNamespace }, () => ({ contents: "", loader: "js" }));
                    },
                };
                await build.esbuild.build({
                    ...build.initialOptions,
                    plugins: [plugin],
                    write: false,
                    sourcemap: false,
                });
                await Promise.all(promises);
                css = cssify(classes, config);
            });
            build.onResolve({ filter: virtualFilter }, ({ path }) => ({ path, namespace: virtualNamespace }));
            build.onLoad({ filter: virtualFilter, namespace: virtualNamespace }, () => ({ contents: css, loader: "css" }));
        },
    };
};
export default { inject, plugin };
