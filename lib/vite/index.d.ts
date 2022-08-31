import type { Plugin } from "vite";
import { IsaaccssRollupPluginOptions } from "../rollup/index.js";
export interface IsaaccssVitePluginOptions extends IsaaccssRollupPluginOptions {
}
declare const isaaccssVitePlugin: (options?: IsaaccssVitePluginOptions) => Plugin[];
export default isaaccssVitePlugin;
