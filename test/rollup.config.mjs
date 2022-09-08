import resolve from "@rollup/plugin-node-resolve";
import sucrase from "@rollup/plugin-sucrase";
import isaaccss from "isaaccss/rollup";
import path from "node:path";
import { fileURLToPath } from "node:url";
import css from "rollup-plugin-import-css";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolvePath = (...segments) => path.resolve(__dirname, ...segments);

/** @type {import("rollup").RollupOptions} */
export default {
  input: resolvePath("sample/index.js"),
  output: { file: resolvePath(".dist/rollup/bundle.js") },
  plugins: [css(), isaaccss({ compress: false }), resolve({ extensions: [".js", ".jsx", ".ts", ".tsx"] }), sucrase({ production: true, transforms: ["jsx", "typescript"] })],
};
