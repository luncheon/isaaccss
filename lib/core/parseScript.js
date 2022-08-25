import { parse } from "@babel/parser";
import { parseClass } from "./parseClass.js";
export const parseScript = (code, options, scriptType, collectTo = new Map()) => {
    const plugins = [];
    scriptType?.jsx && plugins.push("jsx");
    scriptType?.typescript && plugins.push("typescript");
    for (const token of parse(code, { plugins, errorRecovery: true, tokens: true }).tokens) {
        if (token.value && (token.type.label === "string" || token.type.label === "template")) {
            parseClass(token.value, options, collectTo);
        }
    }
    return collectTo;
};
