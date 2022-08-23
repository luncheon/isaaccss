import "css.escape";
import { type IsaacClass, type IsaacClasses, type IsaacConfig } from "./index.browser.js";
export * from "./index.browser.js";
export declare const parseFile: (filename: string, config: IsaacConfig, collectTo?: Map<string, IsaacClass>) => Promise<IsaacClasses>;
