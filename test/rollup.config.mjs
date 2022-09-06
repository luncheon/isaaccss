import resolve from "@rollup/plugin-node-resolve";
import sucrase from "@rollup/plugin-sucrase";
import isaaccss from "isaaccss/rollup";
import css from "rollup-plugin-import-css";

/** @type {import("rollup").RollupOptions} */
export default {
  input: "sample/index.js",
  output: { file: ".dist/rollup/bundle.js" },
  plugins: [css(), isaaccss({ compress: false }), resolve({ extensions: [".js", ".jsx", ".ts", ".tsx"] }), sucrase({ production: true, transforms: ["jsx", "typescript"] })],
};
