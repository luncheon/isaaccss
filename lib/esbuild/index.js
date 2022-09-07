import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { applyPostcss } from "../applyPostcss.js";
import { cssify, defaultAliases, transform } from "../index.node.js";
const inject = createRequire(import.meta.url).resolve("./inject.js");
const pathToLoader = (path) => `${path.endsWith("ts") || path.endsWith("tsx") ? "t" : "j"}s${path.endsWith("x") ? "x" : ""}`;
const pathToBabelParserPlugin = (path) => [
    ...(path.endsWith("ts") || path.endsWith("tsx") ? ["typescript"] : []),
    ...(path.endsWith("x") ? ["jsx"] : []),
];
const plugin = (options) => {
    const filter = options?.filter ?? /\.[cm]?[jt]sx?$/;
    const transformOptions = {
        compress: options?.compress,
        aliases: options?.aliases ?? defaultAliases,
    };
    const transformedCodeMap = new Map();
    return {
        name: "isaaccss",
        setup(build, pipe) {
            if (pipe?.transform) {
                const path = pipe.transform.args.path;
                return { contents: transformedCodeMap.get(path) ?? pipe.transform.contents, loader: pathToLoader(path) };
            }
            const virtualFilter = /^virtual:isaaccss\.css$/;
            const virtualNamespace = "virtual:isaaccss:css";
            let css;
            build.onStart(async () => {
                transformedCodeMap.clear();
                const classes = new Map();
                const promises = [];
                const load = async (path) => {
                    const code = await fs.readFile(path, "utf8");
                    const transformed = transform(code, path, transformOptions, pathToBabelParserPlugin(path), classes);
                    transformedCodeMap.set(path, transformed.code);
                };
                const plugin = {
                    name: "isaaccss:prebuild",
                    setup: build => {
                        build.onLoad({ filter }, ({ path }) => void promises.push(load(path)));
                        build.onResolve({ filter: virtualFilter }, ({ path }) => ({ path, namespace: virtualNamespace }));
                        build.onLoad({ filter: virtualFilter, namespace: virtualNamespace }, () => ({ contents: "", loader: "js" }));
                    },
                };
                await build.esbuild.build({ ...build.initialOptions, plugins: [plugin], write: false, sourcemap: false, logLevel: "error" });
                await Promise.all(promises);
                css = await applyPostcss(cssify(classes.values(), options), options?.postcss);
            });
            build.onLoad({ filter }, async ({ path }) => ({
                contents: transformedCodeMap.get(path) ?? (await fs.readFile(path, "utf8")),
                loader: pathToLoader(path),
            }));
            build.onResolve({ filter: virtualFilter }, ({ path }) => ({ path, namespace: virtualNamespace }));
            build.onLoad({ filter: virtualFilter, namespace: virtualNamespace }, () => ({ contents: css, loader: "css" }));
        },
    };
};
export default { inject, plugin };
