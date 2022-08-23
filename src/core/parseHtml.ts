import { Parser } from "htmlparser2";
import { parseClass } from "./parseClass.js";
import type { IsaacClass, IsaacClasses, IsaacConfig } from "./types.js";

export const parseHtml = (content: string, config: IsaacConfig, collectTo = new Map<string, IsaacClass>()): IsaacClasses => {
  new Parser({ onattribute: (name, value) => name === "class" && parseClass(value, config, collectTo) }).end(content);
  return collectTo;
};
