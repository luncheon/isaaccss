import { Parser } from "htmlparser2";
import { parseClass } from "./parseClass.js";
export const parseHtml = (content, replacements, collectTo = new Map()) => {
    new Parser({ onattribute: (name, value) => name === "class" && parseClass(value, replacements, collectTo) }).end(content);
    return collectTo;
};
