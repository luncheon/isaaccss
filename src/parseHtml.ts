import { Parser } from "htmlparser2";
import { parseClass } from "./parseClass";
import type { IsaacClass, IsaacClasses, IsaacConfig } from "./types";

export const parseHtml = (content: string, config: IsaacConfig, collectTo = new Map<string, IsaacClass>()): IsaacClasses => {
  new Parser({ onattribute: (name, value) => name === "class" && parseClass(value, config, collectTo) }).end(content);
  return collectTo;
};
