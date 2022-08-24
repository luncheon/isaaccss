export type IsaaccssReplacerFunction = (match: [string, ...any[]]) => string;

export interface IsaaccssConfigSource {
  readonly media?: {
    readonly replace?: Iterable<readonly [RegExp, string | IsaaccssReplacerFunction]>;
  };
  readonly selector?: {
    readonly replace?: Iterable<readonly [RegExp, string | IsaaccssReplacerFunction]>;
  };
  readonly property?: {
    readonly replace?: Iterable<readonly [RegExp, string]>;
    readonly known?: Iterable<string>;
  };
  readonly value?: {
    readonly replace?: Iterable<readonly [RegExp, string | IsaaccssReplacerFunction]>;
  };
  readonly specificity?: {
    readonly default?: number;
  };
}

export interface IsaaccssConfig extends IsaaccssConfigSource {
  readonly media: {
    readonly replace: Map<RegExp, string | IsaaccssReplacerFunction>;
  };
  readonly selector: {
    readonly replace: Map<RegExp, string | IsaaccssReplacerFunction>;
  };
  readonly property: {
    readonly replace: Map<RegExp, string>;
    readonly known: Set<string>;
  };
  readonly value: {
    readonly replace: Map<RegExp, string | IsaaccssReplacerFunction>;
  };
  readonly specificity: {
    readonly default: number;
  };
}

export interface IsaaccssClass {
  readonly className: string;
  readonly media?: string;
  readonly layer?: string;
  readonly selector?: string;
  readonly property: string;
  readonly value: string;
  readonly specificity?: number;
  readonly important?: boolean;
}

export type IsaaccssClasses = Map<string, IsaaccssClass>;
