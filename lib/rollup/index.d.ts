import { FilterPattern } from "@rollup/pluginutils";
import { AcceptedPlugin } from "postcss";
import type { Plugin } from "rollup";
import { Aliases, CssifyOptions } from "../index.node.js";
export interface IsaaccssRollupPluginOptions extends CssifyOptions {
    readonly include: FilterPattern;
    readonly exclude: FilterPattern;
    readonly output?: string;
    readonly compress?: boolean;
    readonly aliases?: Aliases | readonly Aliases[];
    readonly postcss?: {
        readonly plugins?: AcceptedPlugin[];
    };
}
export declare const resolveIsaaccssRollupPluginOptions: (options?: IsaaccssRollupPluginOptions) => {
    filter: (id: unknown) => boolean;
    transformOptions: {
        compress: boolean | undefined;
        aliases: Aliases | readonly Aliases[];
    };
    cssifyOptions: IsaaccssRollupPluginOptions | undefined;
};
declare const isaaccssRollupPlugin: (options?: IsaaccssRollupPluginOptions) => Plugin;
export default isaaccssRollupPlugin;
