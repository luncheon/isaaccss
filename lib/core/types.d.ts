export declare type ReplacerFunction = (match: [string, ...any[]]) => string;
export interface Replacements {
    readonly media?: readonly (readonly [RegExp, string | ReplacerFunction])[];
    readonly selector?: readonly (readonly [RegExp, string | ReplacerFunction])[];
    readonly property?: readonly (readonly [RegExp, string])[];
    readonly value?: readonly (readonly [RegExp, string | ReplacerFunction])[];
}
export interface ParserOptions {
    readonly replacements?: Replacements;
}
export interface CssOptions {
    readonly pretty?: boolean;
}
export interface Configuration extends ParserOptions, CssOptions {
}
export interface Style {
    readonly className: string;
    readonly media?: string;
    readonly layer?: string;
    readonly selector?: string;
    readonly property: string;
    readonly value: string;
    readonly specificity?: number;
    readonly important?: boolean;
}
