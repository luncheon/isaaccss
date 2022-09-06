import type { OnLoadArgs, OnLoadResult, Plugin, PluginBuild } from "esbuild";
import { AcceptedPlugin } from "postcss";
import { CssOptions, Replacements } from "../index.node.js";
interface IsaaccssEsbuildPluginOptions extends CssOptions {
    readonly filter?: RegExp;
    readonly compress?: boolean | {
        readonly prefix?: string;
    };
    readonly replacements?: Replacements | readonly Replacements[];
    readonly postcss?: {
        readonly plugins?: AcceptedPlugin[];
    };
}
interface EsbuildPipeablePlugin extends Plugin {
    setup(build: PluginBuild, pipe: {
        transform: {
            args: OnLoadArgs;
            contents: string;
        };
    }): OnLoadResult | undefined;
    setup(build: PluginBuild): void;
}
declare const _default: {
    inject: string;
    plugin: (options?: IsaaccssEsbuildPluginOptions | undefined) => EsbuildPipeablePlugin;
};
export default _default;
