import { Parser } from "htmlparser2";
import { parseClass } from "./parseClass";
export const parseHtml = (html, config) => {
    const classes = new Map();
    new Parser({ onattribute: (name, value) => name === "class" && parseClass(value, config, classes) }).end(html);
    return classes;
};
