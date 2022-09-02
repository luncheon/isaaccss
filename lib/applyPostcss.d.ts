import { AcceptedPlugin } from "postcss";
export declare const applyPostcss: (css: string, options: undefined | {
    readonly plugins?: AcceptedPlugin[];
}) => Promise<string>;
