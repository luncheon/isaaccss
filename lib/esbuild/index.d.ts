import type { Plugin } from "esbuild";
import { Configuration } from "../index.node.js";
interface IsaaccssEsbuildPluginOptions {
    readonly filter?: RegExp;
    readonly config?: Configuration;
}
declare const _default: {
    inject: string;
    plugin: (options?: IsaaccssEsbuildPluginOptions | undefined) => Plugin;
};
export default _default;
