import { Parser } from "htmlparser2";
import { parseClass } from "./parseClass.js";
import type { ParserOptions, Style } from "./types.js";

export const parseHtml = (content: string, options?: ParserOptions, collectTo = new Map<string, Style>()) => {
  new Parser({
    onattribute(name, value) {
      if (name === "class") {
        value.split(" ").forEach(className => {
          const parsed = !collectTo.has(className) && parseClass(className, options);
          parsed && collectTo.set(className, parsed);
        });
      }
    },
  }).end(content);
  return collectTo;
};
