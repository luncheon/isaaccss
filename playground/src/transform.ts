import { defaultAliases } from "isaaccss/aliases";
import { cssify, transform as isaaccssTransform } from "isaaccss/api";
import { transform as sucraseTransform } from "sucrase";

export const transform = (code: string, options: { pretty: boolean }) => {
  try {
    const filename = "App.tsx";
    const babelResult = sucraseTransform(code, {
      production: true,
      transforms: ["typescript", "jsx"],
      jsxPragma: "h",
      jsxFragmentPragma: "Fragment",
    });
    const isaaccssResult = isaaccssTransform(babelResult.code!, filename, { aliases: defaultAliases });
    const css = cssify(isaaccssResult.classes.values(), { pretty: options.pretty });
    return { code: isaaccssResult.code, css };
  } catch (error) {
    console.warn(error);
    return { error: error instanceof Error ? (error as Error).message : "error occurred" };
  }
};
