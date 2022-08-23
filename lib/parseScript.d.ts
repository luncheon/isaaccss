import type { IsaacClass, IsaacClasses, IsaacConfig } from "./types";
export declare const parseScript: (code: string, config: IsaacConfig, options?: {
    readonly jsx?: boolean;
    readonly typescript?: boolean;
}, collectTo?: Map<string, IsaacClass>) => IsaacClasses;
