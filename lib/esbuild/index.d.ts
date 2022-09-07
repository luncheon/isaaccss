import type { OnLoadArgs, OnLoadResult, Plugin, PluginBuild } from "esbuild";
import { AcceptedPlugin } from "postcss";
import { Aliases, CssifyOptions } from "../index.node.js";
export interface IsaaccssEsbuildPluginOptions extends CssifyOptions {
    readonly filter?: RegExp;
    readonly compress?: boolean | {
        readonly prefix?: string;
    };
    readonly aliases?: Aliases | readonly Aliases[];
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
