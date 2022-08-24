import type { Style } from "./types.js";
export declare const cssify: (classes: ReadonlyMap<string, Style>, options?: {
    pretty?: boolean;
}) => string;
