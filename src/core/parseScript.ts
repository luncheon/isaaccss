import { parse, ParserOptions as BabelParserOptions } from "@babel/parser";
import { parseClass } from "./parseClass.js";
import type { ParserOptions, Style } from "./types.js";

export const parseScript = (
  code: string,
  options?: ParserOptions,
  scriptType?: { readonly jsx?: boolean; readonly typescript?: boolean },
  collectTo = new Map<string, Style>()
) => {
  const plugins: BabelParserOptions["plugins"] = [];
  scriptType?.jsx && plugins.push("jsx");
  scriptType?.typescript && plugins.push("typescript");
  for (const token of parse(code, { plugins, errorRecovery: true, tokens: true }).tokens!) {
    if (token.value && (token.type.label === "string" || token.type.label === "template")) {
      parseClass(token.value, options, collectTo);
    }
  }
  return collectTo;
};
