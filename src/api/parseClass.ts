import { all as __knownCssProperties } from "known-css-properties";
import type { Alias, Aliases, CssClass, CssProperty, DeepArray, ParserOptions, PropertyAlias } from "./types.js";

type Writable<T> = {
  -readonly [P in keyof T]: T[P];
};

const knownCssPropertySet = new Set(__knownCssProperties);

function* deepFlatFilterMap<T, R>(
  arrayOrElement: T | DeepArray<T> | undefined | null | false,
  selector: (element: T) => R | undefined | null | false,
  predicate?: (selected: R) => boolean,
): Iterable<R> {
  if (arrayOrElement) {
    if (Array.isArray(arrayOrElement)) {
      for (const element of arrayOrElement) {
        yield* deepFlatFilterMap(element, selector);
      }
    } else {
      const element = selector(arrayOrElement as T);
      if (element !== undefined && element !== null && element !== false && (!predicate || predicate(element))) {
        yield element;
      }
    }
  }
}

const applyAliases = (source: string, tokenPattern: RegExp, aliases: Alias | readonly Alias[]): string => {
  if (!aliases) {
    return source;
  }
  if (!Array.isArray(aliases)) {
    return source.replaceAll(tokenPattern, token => (aliases as { readonly [token in string]: string })[token] ?? token);
  }
  if (aliases[0] instanceof RegExp) {
    return source.replace(aliases[0], aliases[1]);
  }
  for (const alias of aliases) {
    source = applyAliases(source, tokenPattern, alias);
  }
  return source;
};

const applyPropertyAliases = (source: readonly string[], aliases: PropertyAlias | readonly PropertyAlias[]): readonly string[] => {
  if (!aliases) {
    return source;
  }
  if (!Array.isArray(aliases)) {
    return ([] as string[]).concat(...source.map(s => (aliases as { readonly [token in string]: string | readonly string[] })[s] ?? s));
  }
  if (aliases[0] instanceof RegExp) {
    const [search, replacer] = aliases;
    if (Array.isArray(replacer)) {
      return source.flatMap(s => (search.test(s) ? replacer.map(r => s.replace(search, r)) : [s]));
    } else {
      return source.map(s => s.replace(search, replacer));
    }
  }
  for (const alias of aliases) {
    source = applyPropertyAliases(source, alias);
  }
  return source;
};

const unescapeBackslash = (s: string) => s.replace(/\\(.)/g, "$1");
const unescapeWhitespace = (s: string) => s.replace(/(^|[^\\])(\\\\)*_/g, "$1$2 ");

const transformMediaOrContainer = (
  query: string,
  aliases: ParserOptions["aliases"] | undefined,
  aliasSelector: (a: Aliases) => Alias | readonly Alias[],
): string => {
  for (const alias of deepFlatFilterMap(aliases, aliasSelector)) {
    query = applyAliases(query, /[\w$#@-]+/g, alias);
  }
  query = unescapeWhitespace(query);
  query = query.replace(/(^| )([^ ()]+\b[^ ()]+)($| )/g, "$1($2)$3");
  query = query.replace(/([^ ])\(/g, "$1 (");
  return unescapeBackslash(query);
};

const transformSelector = (selector: string, aliases?: ParserOptions["aliases"]): string => {
  for (const alias of deepFlatFilterMap(aliases, a => a.selector)) {
    selector = applyAliases(selector, /([:>+~_]|::)[\w$#@-]+/g, alias);
  }
  selector = unescapeWhitespace(selector);
  return unescapeBackslash(selector);
};

const transformProperty = (property: string, aliases?: ParserOptions["aliases"]): [string[], string[]] => {
  if (property.startsWith("--")) {
    return [[property], []];
  }
  let properties: readonly string[] = [property];
  for (const alias of deepFlatFilterMap(aliases, a => a.property)) {
    properties = applyPropertyAliases(properties, alias);
  }
  const known: string[] = [];
  const unknown: string[] = [];
  for (const p of properties) {
    knownCssPropertySet.has(p) ? known.push(p) : unknown.push(p);
  }
  return [known, unknown];
};

const transformValue = (property: string, value: string, aliases?: ParserOptions["aliases"]): string => {
  for (const alias of deepFlatFilterMap(aliases, a => a.value)) {
    for (const [p, a] of alias) {
      if (p instanceof RegExp ? p.test(property) : p === property) {
        value = applyAliases(value, /[\w$#@-]+/g, a);
      }
    }
  }
  value = unescapeWhitespace(value);
  value = value.replace(/\$([_a-zA-Z0-9-]*[a-zA-Z0-9])/g, "var(--$1)");
  return unescapeBackslash(value);
};

export const parseClass = (className: string, options?: ParserOptions): Writable<CssClass> => {
  const aliases = options?.aliases;
  const match = className.match(
    // @media/                   @^container/                selector/                property    ...properties     ?    *
    /^(?:@((?:[^/\\]|\\.)+?)\/)?(?:@\^((?:[^/\\]|\\.)+?)\/)?(?:((?:[^/\\]|\\.)+?)\/)?([^:]+:.+?!?(?:;[^:]+:.+?!?)*)(\??)(\**)$/,
  );
  if (!match) {
    return { className, properties: [], unknownProperties: [className], specificity: 1 };
  }
  const properties: CssProperty[] = [];
  const unknownProperties: string[] = [];
  for (const s of match[4].split(";")) {
    const match = s.match(/^([^:]+):(.+?)(!?)$/);
    if (match) {
      const [known, unknown] = transformProperty(match[1], aliases);
      known.forEach(name => properties.push({ name, value: transformValue(name, match[2], aliases), important: !!match[3] }));
      unknownProperties.push(...unknown);
    } else {
      unknownProperties.push(s);
    }
  }
  const style: Writable<CssClass> = {
    className,
    properties,
    unknownProperties,
    specificity: (match[5] === "?" ? 0 : 1) + match[6].length,
  };
  if (match[1]?.startsWith("^")) {
    if (match[2]) {
      return { className, properties: [], unknownProperties: [className], specificity: 1 };
    }
    style.container = transformMediaOrContainer(match[1].slice(1), aliases, a => a.container);
  } else {
    match[1] && (style.media = transformMediaOrContainer(match[1], aliases, a => a.media));
    match[2] && (style.container = transformMediaOrContainer(match[2], aliases, a => a.container));
  }
  match[5] === "?" && (style.layer = "");
  match[3] && (style.selector = transformSelector(match[3], aliases));
  return style;
};
