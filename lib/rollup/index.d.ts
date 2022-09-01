import { FilterPattern } from "@rollup/pluginutils";
import type { Plugin } from "rollup";
import { CssOptions, Replacements } from "../index.node.js";
export interface IsaaccssRollupPluginOptions {
    readonly include: FilterPattern;
    readonly exclude: FilterPattern;
    readonly output?: string;
    readonly config?: CssOptions & {
        readonly replacements?: Replacements | readonly Replacements[];
    };
}
export declare const resolveIsaaccssRollupPluginOptions: (options?: IsaaccssRollupPluginOptions) => {
    filter: (id: unknown) => boolean;
    parserOptions: {
        replacements: Replacements;
    };
    cssifyOptions: (CssOptions & {
        readonly replacements?: Replacements | readonly Replacements[] | undefined;
    }) | undefined;
};
declare const isaaccssRollupPlugin: (options?: IsaaccssRollupPluginOptions) => Plugin;
export default isaaccssRollupPlugin;
