import { Parser } from "htmlparser2";
import { parseClass } from "./parseClass.js";
import type { IsaaccssClass, IsaaccssClasses, IsaaccssConfig } from "./types.js";

export const parseHtml = (content: string, config: IsaaccssConfig, collectTo = new Map<string, IsaaccssClass>()): IsaaccssClasses => {
  new Parser({ onattribute: (name, value) => name === "class" && parseClass(value, config, collectTo) }).end(content);
  return collectTo;
};
