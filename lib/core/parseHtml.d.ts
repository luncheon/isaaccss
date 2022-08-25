import type { ParserOptions, Style } from "./types.js";
export declare const parseHtml: (content: string, options?: ParserOptions, collectTo?: Map<string, Style>) => Map<string, Style>;
