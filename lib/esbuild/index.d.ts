import type { Plugin } from "esbuild";
import { AcceptedPlugin } from "postcss";
import { CssOptions, Replacements } from "../index.node.js";
interface IsaaccssEsbuildPluginOptions extends CssOptions {
    readonly filter?: RegExp;
    readonly replacements?: Replacements | readonly Replacements[];
    readonly postcss?: {
        readonly plugins?: AcceptedPlugin[];
    };
}
declare const _default: {
    inject: string;
    plugin: (options?: IsaaccssEsbuildPluginOptions | undefined) => Plugin;
};
export default _default;
