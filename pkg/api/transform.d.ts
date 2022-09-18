import { ParserOptions as BabelParserOptions } from "@babel/parser";
import type { CssClass, TransformOptions } from "./types.js";
export declare const transform: (code: string, filename: string, options?: TransformOptions, babelParserPlugins?: BabelParserOptions["plugins"], classes?: Map<string, CssClass>) => {
    code: string;
    classes: Map<string, CssClass>;
};
