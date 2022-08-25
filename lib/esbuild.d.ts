import type { OnLoadArgs, OnLoadResult, Plugin, PluginBuild } from "esbuild";
import { Configuration } from "./index.node.js";
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
    readonly output: {
        readonly filename: string;
        readonly append: boolean;
    } | ((css: string) => void | Promise<void>);
    readonly filter?: RegExp;
    readonly config?: Configuration;
}
declare const isaaccssEsbuildPlugin: (options: IsaaccssEsbuildPluginOptions) => EsbuildPipeablePlugin;
export default isaaccssEsbuildPlugin;
