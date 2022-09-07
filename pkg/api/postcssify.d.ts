import { AcceptedPlugin } from "postcss";
export declare const postcssify: (css: string, options: undefined | {
    readonly plugins?: AcceptedPlugin[];
}) => Promise<string>;
