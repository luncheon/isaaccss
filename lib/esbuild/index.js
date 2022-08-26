import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { cssify, defaultReplacements, mergeReplacements, parseScript, } from "../index.node.js";
const inject = createRequire(import.meta.url).resolve("./inject.js");
const parseFile = async (filename, options, classes) => {
    const match = filename.match(/\.[cm]?([jt])s(x?)$/);
    match && parseScript(await fs.readFile(filename, "utf8"), options, { jsx: !!match[2], typescript: match[1] === "t" }, classes);
};
const plugin = (options) => {
    const parserOptions = {
        replacements: options?.config?.replacements ? mergeReplacements(options?.config?.replacements) : defaultReplacements,
    };
    return {
        name: "isaaccss",
        setup: async (build) => {
            const virtualFilter = /^virtual:isaaccss\.css$/;
            const virtualNamespace = "virtual:isaaccss:css";
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
                                    promises.push(parseFile(resolved.path, parserOptions, classes));
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
                css = cssify(classes, options?.config);
            });
            build.onResolve({ filter: virtualFilter }, ({ path }) => ({ path, namespace: virtualNamespace }));
            build.onLoad({ filter: virtualFilter, namespace: virtualNamespace }, () => ({ contents: css, loader: "css" }));
        },
    };
};
export default { inject, plugin };
