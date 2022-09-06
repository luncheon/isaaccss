export type Replacer = string | Parameters<string["replace"]>[1];
export type ReplacementElement = { readonly [token in string]: string } | readonly [RegExp, Replacer];
export type Replacement = ReplacementElement | Replacement[] | undefined | null | false;

export interface Replacements {
  readonly media?: Replacement;
  readonly selector?: Replacement;
  readonly property?: Replacement;
  readonly value?: Replacement;
}

export interface ParserOptions {
  readonly replacements?: Replacements;
}

export interface TransformOptions extends ParserOptions {
  readonly compress?: boolean | { readonly prefix?: string };
}

export interface CssOptions {
  readonly pretty?: boolean;
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
