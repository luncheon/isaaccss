import "css.escape";
import type { CssifyOptions, Style } from "./types.js";
declare type Classes = Iterable<Style>;
export declare const cssify: (classes: Classes, options?: CssifyOptions) => string;
export {};
