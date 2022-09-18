import type { CssClass, ParserOptions } from "./types.js";
declare type Writable<T> = {
    -readonly [P in keyof T]: T[P];
};
export declare const parseClass: (className: string, options?: ParserOptions) => Writable<CssClass>;
export {};
