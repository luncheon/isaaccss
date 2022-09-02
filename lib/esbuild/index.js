import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { applyPostcss } from "../applyPostcss.js";
import { cssify, defaultReplacements, mergeReplacements, parseTaggedTemplates, } from "../index.node.js";
const inject = createRequire(import.meta.url).resolve("./inject.js");
const parseFile = async (filename, options, classes) => {
    const match = filename.match(/\.[cm]?([jt])s(x?)$/);
    if (match) {
        const babelParserPlugins = [...(match[2] ? ["jsx"] : []), ...(match[1] === "t" ? ["typescript"] : [])];
        const [, invalidClasses] = parseTaggedTemplates(await fs.readFile(filename, "utf8"), options, babelParserPlugins, classes);
        invalidClasses.forEach((nodes, className) => {
            const start = nodes[0].loc?.start;
            console.warn(`isaaccss: ${filename}${start ? `:${start.line}` : ""} - Couldn't parse class "${className}".`);
        });
    }
};
const plugin = (options) => {
    const parserOptions = {
        replacements: options?.replacements ? mergeReplacements(options?.replacements) : defaultReplacements,
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
                css = await applyPostcss(cssify(classes.values(), options), options?.postcss);
            });
            build.onResolve({ filter: virtualFilter }, ({ path }) => ({ path, namespace: virtualNamespace }));
            build.onLoad({ filter: virtualFilter, namespace: virtualNamespace }, () => ({ contents: css, loader: "css" }));
        },
    };
};
export default { inject, plugin };
