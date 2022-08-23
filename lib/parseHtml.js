import { Parser } from "htmlparser2";
import { parseClass } from "./parseClass";
export const parseHtml = (content, config, collectTo = new Map()) => {
    new Parser({ onattribute: (name, value) => name === "class" && parseClass(value, config, collectTo) }).end(content);
    return collectTo;
};
