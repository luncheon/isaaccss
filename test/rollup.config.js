import resolve from "@rollup/plugin-node-resolve";
import sucrase from "@rollup/plugin-sucrase";
import css from "rollup-plugin-import-css";
import isaaccss from "../lib/rollup/index.js";

export default {
  input: "sample/index.js",
  output: { file: ".dist/rollup/bundle.js" },
  plugins: [
    css(),
    isaaccss(),
    resolve({ extensions: [".js", ".jsx", ".ts", ".tsx"] }),
    sucrase({ production: true, transforms: ["jsx", "typescript"] }),
  ],
};
