export type IsaacReplacerFunction = (match: [string, ...any[]]) => string;

export interface IsaacConfigSource {
  readonly media?: {
    readonly replace?: Iterable<readonly [string | RegExp, string | IsaacReplacerFunction]>;
  };
  readonly selector?: {
    readonly replace?: Iterable<readonly [string | RegExp, string | IsaacReplacerFunction]>;
  };
  readonly property?: {
    readonly known?: Iterable<string>;
    readonly replace?: Iterable<readonly [string | RegExp, string]>;
  };
  readonly value?: {
    readonly replace?: Iterable<readonly [string | RegExp, string | IsaacReplacerFunction]>;
  };
  readonly specificity?: {
    readonly default?: number;
  };
}

export interface IsaacConfig extends IsaacConfigSource {
  readonly media: {
    readonly replace: Map<string | RegExp, string | IsaacReplacerFunction>;
  };
  readonly selector: {
    readonly replace: Map<string | RegExp, string | IsaacReplacerFunction>;
  };
  readonly property: {
    readonly replace: Map<string | RegExp, string>;
    readonly known: Set<string>;
  };
  readonly value: {
    readonly replace: Map<string | RegExp, string | IsaacReplacerFunction>;
  };
  readonly specificity: {
    readonly default: number;
  };
}

export interface IsaacClass {
  readonly className: string;
  readonly media?: string;
  readonly layer?: string;
  readonly selector?: string;
  readonly property: string;
  readonly value: string;
  readonly specificity?: number;
  readonly important?: boolean;
}
