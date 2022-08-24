import type { OnLoadArgs, OnLoadResult, Plugin, PluginBuild } from "esbuild";
import { Replacements } from "./index.node.js";
interface EsbuildPipeableTransformArgs {
    readonly args: OnLoadArgs;
    readonly contents: string;
}
interface EsbuildPipeablePlugin extends Plugin {
    setup(build: PluginBuild, pipe: {
        transform: EsbuildPipeableTransformArgs;
    }): OnLoadResult;
    setup(build: PluginBuild): void;
}
interface IsaaccssEsbuildPluginOptions {
    readonly filter?: RegExp;
    readonly output: {
        readonly filename: string;
        readonly append: boolean;
    } | ((css: string) => void | Promise<void>);
    readonly config?: {
        readonly replacements?: Replacements;
    };
}
declare const isaaccssEsbuildPlugin: (options: IsaaccssEsbuildPluginOptions) => EsbuildPipeablePlugin;
export default isaaccssEsbuildPlugin;
