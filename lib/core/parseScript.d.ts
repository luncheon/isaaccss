import type { Replacements, Style } from "./types.js";
export declare const parseScript: (code: string, replacements: Replacements, options?: {
    readonly jsx?: boolean;
    readonly typescript?: boolean;
}, collectTo?: Map<string, Style>) => Map<string, Style>;
