import { FilterPattern } from "@rollup/pluginutils";
import { AcceptedPlugin } from "postcss";
import type { Plugin } from "rollup";
import { CssOptions, Replacements } from "../index.node.js";
export interface IsaaccssRollupPluginOptions extends CssOptions {
    readonly include: FilterPattern;
    readonly exclude: FilterPattern;
    readonly output?: string;
    readonly replacements?: Replacements | readonly Replacements[];
    readonly postcss?: {
        readonly plugins?: AcceptedPlugin[];
    };
}
export declare const resolveIsaaccssRollupPluginOptions: (options?: IsaaccssRollupPluginOptions) => {
    filter: (id: unknown) => boolean;
    parserOptions: {
        replacements: Replacements;
    };
    cssifyOptions: IsaaccssRollupPluginOptions | undefined;
};
declare const isaaccssRollupPlugin: (options?: IsaaccssRollupPluginOptions) => Plugin;
export default isaaccssRollupPlugin;
