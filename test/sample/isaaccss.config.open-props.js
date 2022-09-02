import OpenProps from "open-props";
import postcssJitProps from "postcss-jit-props";

export default {
  postcss: {
    plugins: [postcssJitProps(OpenProps)],
  },
};
