import type { IsaaccssClass, IsaaccssClasses, IsaaccssConfig } from "./types.js";
export declare const parseScript: (code: string, config: IsaaccssConfig, options?: {
    readonly jsx?: boolean;
    readonly typescript?: boolean;
}, collectTo?: Map<string, IsaaccssClass>) => IsaaccssClasses;
