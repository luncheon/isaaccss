import { ParserOptions as BabelParserOptions } from "@babel/parser";
import type { Style, TransformOptions } from "./types.js";
export declare const transform: (code: string, filename: string, options?: TransformOptions, babelParserPlugins?: BabelParserOptions["plugins"], classes?: Map<string, Style>) => {
    code: string;
    classes: Map<string, Style>;
};
