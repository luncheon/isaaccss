import { parse } from "@babel/parser";
import { parseClass } from "./parseClass.js";
export const parseScript = (code, replacements, options, collectTo = new Map()) => {
    const plugins = [];
    options?.jsx && plugins.push("jsx");
    options?.typescript && plugins.push("typescript");
    for (const token of parse(code, { plugins, errorRecovery: true, tokens: true }).tokens) {
        if (token.value && (token.type.label === "string" || token.type.label === "template")) {
            parseClass(token.value, replacements, collectTo);
        }
    }
    return collectTo;
};
