import type { ParserOptions, Style } from "./types.js";
export declare const parseClass: (className: string, options?: ParserOptions, collectTo?: Map<string, Style>) => Map<string, Style>;
