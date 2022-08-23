import { Parser } from "htmlparser2";
import { parseClass } from "./parseClass";
import type { IsaacClass, IsaacConfig } from "./types";

export const parseHtml = (html: string, config: IsaacConfig): Map<string, IsaacClass> => {
  const classes = new Map<string, IsaacClass>();
  new Parser({ onattribute: (name, value) => name === "class" && parseClass(value, config, classes) }).end(html);
  return classes;
};
