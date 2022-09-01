import { ParserOptions as BabelParserOptions } from "@babel/parser";
import type { StringLiteral, TemplateElement } from "@babel/types";
import type { ParserOptions, Style } from "./types.js";
export declare const parseTaggedTemplates: (code: string, options?: ParserOptions, babelParserPlugins?: BabelParserOptions["plugins"], collectClassesTo?: Map<string, Style>, collectInvalidClassesTo?: Map<string, (StringLiteral | TemplateElement)[]>) => [Map<string, Style>, Map<string, (StringLiteral | TemplateElement)[]>];
