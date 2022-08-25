import type { ParserOptions, Style } from "./types.js";
export declare const parseScript: (code: string, options?: ParserOptions, scriptType?: {
    readonly jsx?: boolean;
    readonly typescript?: boolean;
}, collectTo?: Map<string, Style>) => Map<string, Style>;
