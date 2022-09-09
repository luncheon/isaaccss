import { all as __knownCssProperties } from "known-css-properties";
import type { Alias, DeepArray, ParserOptions, Style, StyleProperty } from "./types.js";

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

const unescapeBackslash = (s: string) => s.replace(/\\(.)/g, "$1");
const unescapeWhitespace = (s: string) => s.replace(/(^|[^\\])(\\\\)*_/g, "$1$2 ");

const transformMedia = (media: string, aliases?: ParserOptions["aliases"]): string => {
  for (const alias of deepFlatFilterMap(aliases, a => a.media)) {
    media = applyAliases(media, /[\w$#@-]+/g, alias);
  }
  media = unescapeWhitespace(media);
  media = media.replace(/(^| )([^ ()]+\b[^ ()]+)($| )/g, "$1($2)$3");
  return unescapeBackslash(media);
};

const transformSelector = (selector: string, aliases?: ParserOptions["aliases"]): string => {
  for (const alias of deepFlatFilterMap(aliases, a => a.selector)) {
    selector = applyAliases(selector, /([:>+~_]|::)[\w$#@-]+/g, alias);
  }
  selector = unescapeWhitespace(selector);
  return unescapeBackslash(selector);
};

const transformProperty = (property: string, aliases?: ParserOptions["aliases"]): string | undefined => {
  if (property.startsWith("--")) {
    return property;
  }
  for (const alias of deepFlatFilterMap(aliases, a => a.property)) {
    property = applyAliases(property, /^.*$/g, alias);
  }
  if (knownCssPropertySet.has(property)) {
    return property;
  }
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

export const parseClass = (className: string, options?: ParserOptions): Writable<Style> => {
  const aliases = options?.aliases;
  const match = className.match(
    // @media/                   selector/                properties                    ?    *
    /^(?:@((?:[^/\\]|\\.)+?)\/)?(?:((?:[^/\\]|\\.)+?)\/)?([^:]+:.+?!?(?:;[^:]+:.+?!?)*)(\??)(\**)$/,
  );
  if (!match) {
    return { className, properties: [], unknownProperties: [className], specificity: 1 };
  }
  const properties: StyleProperty[] = [];
  const unknownProperties: string[] = [];
  for (const s of match[3].split(";")) {
    const match = s.match(/^([^:]+):(.+?)(!?)$/);
    const name = match && transformProperty(match[1], aliases);
    if (name) {
      properties.push({ name, value: transformValue(name, match[2], aliases), important: !!match[3] });
    } else {
      unknownProperties.push(s);
    }
  }
  const style: Writable<Style> = { className, properties, unknownProperties, specificity: (match[4] === "?" ? 0 : 1) + match[5].length };
  match[1] && (style.media = transformMedia(match[1], aliases));
  match[4] === "?" && (style.layer = "");
  match[2] && (style.selector = transformSelector(match[2], aliases));
  return style;
};
