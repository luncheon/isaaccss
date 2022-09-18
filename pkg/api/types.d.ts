export declare type AliasElement = {
    readonly [token in string]: string;
} | readonly [RegExp, string | Parameters<string["replace"]>[1]];
export declare type Alias = AliasElement | undefined | null | false;
export declare type PropertyAlias = {
    readonly [token in string]: string | readonly string[];
} | readonly [RegExp, string | readonly string[]] | undefined | null | false;
export declare type ValueAlias = readonly [property: string | RegExp, alias: Alias | readonly Alias[]];
export interface Aliases {
    readonly media?: Alias | readonly Alias[];
    readonly selector?: Alias | readonly Alias[];
    readonly property?: PropertyAlias | readonly PropertyAlias[];
    readonly value?: readonly ValueAlias[];
}
export declare type DeepArray<T> = readonly (T | DeepArray<T>)[];
export interface ParserOptions {
    readonly aliases?: Aliases | DeepArray<Aliases>;
}
export interface TransformOptions extends ParserOptions {
    readonly compress?: boolean | {
        readonly prefix?: string;
    };
}
export interface CssifyOptions {
    readonly pretty?: boolean;
}
export interface CssClass {
    readonly className: string;
    readonly media?: string;
    readonly layer?: string;
    readonly selector?: string;
    readonly specificity: number;
    readonly properties: readonly CssProperty[];
    readonly unknownProperties: readonly string[];
}
export interface CssProperty {
    readonly name: string;
    readonly value: string;
    readonly important: boolean;
}
