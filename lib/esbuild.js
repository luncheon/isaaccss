import fs from "node:fs/promises";
import { cssify, defaultReplacements, parseScript } from "./index.node.js";
const isaaccssEsbuildPlugin = (options) => {
    if (!options?.output) {
        throw Error('isaaccss esbuild plugin: "output" option is required');
    }
    const pluginName = "isaaccss";
    const replacements = options.config?.replacements ?? defaultReplacements;
    const classes = new Map();
    const transform = (filename, contents) => {
        const match = filename.match(/\.[cm]?([jt])s(x?)/);
        match && parseScript(contents, replacements, { jsx: !!match[2], typescript: match[1] === "t" }, classes);
        return { contents };
    };
    return {
        name: pluginName,
        setup: (build, pipe) => {
            if (pipe?.transform) {
                return transform(pipe.transform.args.path, pipe.transform.contents);
            }
            build.onLoad({ filter: options.filter ?? /\.[cm][jt]x?$/ }, async ({ path }) => transform(path, await fs.readFile(path, "utf8")));
            build.onEnd(() => {
                const css = cssify(classes);
                classes.clear();
                if (typeof options.output === "function") {
                    return options.output(css);
                }
                else {
                    return fs.writeFile(options.output.filename, css, { encoding: "utf8", flag: options.output.append ? "a" : "w" });
                }
            });
        },
    };
};
export default isaaccssEsbuildPlugin;
