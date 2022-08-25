import { Parser } from "htmlparser2";
import { parseClass } from "./parseClass.js";
export const parseHtml = (content, options, collectTo = new Map()) => {
    new Parser({ onattribute: (name, value) => name === "class" && parseClass(value, options, collectTo) }).end(content);
    return collectTo;
};
