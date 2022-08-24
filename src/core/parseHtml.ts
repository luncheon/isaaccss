import { Parser } from "htmlparser2";
import { parseClass } from "./parseClass.js";
import type { Replacements, Style } from "./types.js";

export const parseHtml = (content: string, replacements: Replacements, collectTo = new Map<string, Style>()) => {
  new Parser({ onattribute: (name, value) => name === "class" && parseClass(value, replacements, collectTo) }).end(content);
  return collectTo;
};
