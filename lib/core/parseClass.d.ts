import type { ParserOptions } from "./types.js";
export declare const parseClass: (className: string, options?: ParserOptions) => {
    className: string;
    media: string | undefined;
    layer: string | undefined;
    selector: string | undefined;
    property: string;
    value: string;
    specificity: number;
    important: true | undefined;
} | undefined;
