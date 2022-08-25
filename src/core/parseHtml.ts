import { Parser } from "htmlparser2";
import { parseClass } from "./parseClass.js";
import type { ParserOptions, Style } from "./types.js";

export const parseHtml = (content: string, options?: ParserOptions, collectTo = new Map<string, Style>()) => {
  new Parser({ onattribute: (name, value) => name === "class" && parseClass(value, options, collectTo) }).end(content);
  return collectTo;
};
