export type AliasElement = { readonly [token in string]: string } | readonly [RegExp, string | Parameters<string["replace"]>[1]];
export type Alias = AliasElement | undefined | null | false;

export interface Aliases {
  readonly media?: Alias | readonly Alias[];
  readonly selector?: Alias | readonly Alias[];
  readonly property?: Alias | readonly Alias[];
  readonly value?: Alias | readonly Alias[];
}

export type DeepArray<T> = readonly (T | DeepArray<T>)[];

export interface ParserOptions {
  readonly aliases?: Aliases | DeepArray<Aliases>;
}

export interface TransformOptions extends ParserOptions {
  readonly compress?: boolean | { readonly prefix?: string };
}

export interface CssifyOptions {
  readonly pretty?: boolean;
}

export interface Style {
  readonly className: string;
  readonly media?: string;
  readonly layer?: string;
  readonly selector?: string;
  readonly specificity?: number;
  readonly properties: readonly StyleProperty[];
}

export interface StyleProperty {
  readonly name: string;
  readonly value: string;
  readonly important: boolean;
}
