import type { Plugin } from "esbuild";
import { CssOptions, Replacements } from "../index.node.js";
interface IsaaccssEsbuildPluginOptions {
    readonly filter?: RegExp;
    readonly config?: CssOptions & {
        readonly replacements?: Replacements | readonly Replacements[];
    };
}
declare const _default: {
    inject: string;
    plugin: (options?: IsaaccssEsbuildPluginOptions | undefined) => Plugin;
};
export default _default;
