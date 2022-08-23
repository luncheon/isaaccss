import { parse, ParserOptions } from "@babel/parser";
import { parseClass } from "./parseClass.js";
import type { IsaacClass, IsaacClasses, IsaacConfig } from "./types.js";

export const parseScript = (
  code: string,
  config: IsaacConfig,
  options?: { readonly jsx?: boolean; readonly typescript?: boolean },
  collectTo = new Map<string, IsaacClass>()
): IsaacClasses => {
  const plugins: ParserOptions["plugins"] = [];
  options?.jsx && plugins.push("jsx");
  options?.typescript && plugins.push("typescript");
  for (const token of parse(code, { plugins, errorRecovery: true, tokens: true }).tokens!) {
    if (token.value && (token.type.label === "string" || token.type.label === "template")) {
      parseClass(token.value, config, collectTo);
    }
  }
  return collectTo;
};
