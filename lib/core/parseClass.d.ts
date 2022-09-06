import type { ParserOptions } from "./types.js";
export declare const parseClass: (className: string, options?: ParserOptions) => {
    className: string;
    media: string | undefined;
    layer: string | undefined;
    selector: string | undefined;
    specificity: number;
    properties: {
        name: string;
        value: string;
        important: boolean;
    }[];
} | undefined;
