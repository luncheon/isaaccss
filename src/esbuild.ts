import type { OnLoadArgs, OnLoadResult, Plugin, PluginBuild } from "esbuild";
import fs from "node:fs/promises";
import { Configuration, cssify, defaultReplacements, parseScript, Style } from "./index.node.js";

interface EsbuildPipeableTransformArgs {
  readonly args: OnLoadArgs;
  readonly contents: string;
}

interface EsbuildPipeablePlugin extends Plugin {
  setup(build: PluginBuild, pipe: { transform: EsbuildPipeableTransformArgs }): OnLoadResult;
  setup(build: PluginBuild): void;
}

interface IsaaccssEsbuildPluginOptions {
  readonly output: { readonly filename: string; readonly append: boolean } | ((css: string) => void | Promise<void>);
  readonly filter?: RegExp;
  readonly config?: Configuration;
}

const isaaccssEsbuildPlugin = (options: IsaaccssEsbuildPluginOptions): EsbuildPipeablePlugin => {
  if (!options?.output) {
    throw Error('isaaccss esbuild plugin: "output" option is required');
  }
  const pluginName = "isaaccss";
  const config: Configuration = {
    replacements: options?.config?.replacements ?? defaultReplacements,
    pretty: options?.config?.pretty,
  };
  const classes = new Map<string, Style>();
  const transform = (filename: string, contents: string) => {
    const match = filename.match(/\.[cm]?([jt])s(x?)/);
    match && parseScript(contents, config, { jsx: !!match[2], typescript: match[1] === "t" }, classes);
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
        const css = cssify(classes, config);
        classes.clear();
        if (typeof options.output === "function") {
          return options.output(css);
        } else {
          return fs.writeFile(options.output.filename, css, { encoding: "utf8", flag: options.output.append ? "a" : "w" });
        }
      });
    },
  } as EsbuildPipeablePlugin;
};

export default isaaccssEsbuildPlugin;
