import "css.escape";
import type { CssClass, CssifyOptions } from "./types.js";
declare type Classes = Iterable<CssClass>;
export declare const cssify: (classes: Classes, options?: CssifyOptions) => string;
export {};
