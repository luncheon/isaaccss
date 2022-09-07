import { all as __knownCssProperties } from "known-css-properties";
import type { AliasElement, Aliases, ParserOptions, Style, StyleProperty } from "./types.js";

type Writable<T> = {
  -readonly [P in keyof T]: T[P];
};

const knownCssPropertySet = new Set(__knownCssProperties);

function* flattenAliases(aliases: ParserOptions["aliases"], key: keyof Aliases): Iterable<AliasElement> {
  if (!aliases) {
    return;
  }
  if (Array.isArray(aliases)) {
    for (const alias of aliases) {
      yield* flattenAliases(alias, key);
    }
    return;
  }
  const alias = (aliases as Aliases)[key];
  if (!alias) {
    return;
  }
  if (!Array.isArray(alias) || alias[0] instanceof RegExp) {
    yield alias as AliasElement;
  } else {
    for (const a of alias) {
      if (a) {
        yield a;
      }
    }
  }
}

const unescapeBackslash = (s: string) => s.replace(/\\(.)/g, "$1");
const unescapeWhitespace = (s: string) => s.replace(/(^|[^\\])(\\\\)*_/g, "$1$2 ");

const replaceTokens = (source: string, aliases: Iterable<AliasElement>, tokenPattern: RegExp): string => {
  for (const alias of aliases) {
    if (Array.isArray(alias)) {
      source = source.replace(alias[0], alias[1]);
    } else {
      source = source.replaceAll(tokenPattern, token => (alias as { readonly [token in string]: string })[token] ?? token);
    }
  }
  return source;
};

const replaceProperty = (property: string, aliases: Iterable<AliasElement>): string => {
  for (const alias of aliases) {
    if (Array.isArray(alias)) {
      property = property.replace(alias[0], alias[1]);
    } else {
      property = (alias as { readonly [token in string]: string })[property] || property;
    }
  }
  return property;
};

const transformMedia = (media: string, aliases?: ParserOptions["aliases"]): string => {
  media = replaceTokens(media, flattenAliases(aliases, "media"), /[\w$#-]+/g);
  media = unescapeWhitespace(media);
  media = media.replace(/(^| )([^ ()]+\b[^ ()]+)($| )/g, "$1($2)$3");
  return unescapeBackslash(media);
};

const transformSelector = (selector: string, aliases?: ParserOptions["aliases"]): string => {
  selector = replaceTokens(selector, flattenAliases(aliases, "selector"), /([:>+~_]|::)[\w$#-]+/g);
  selector = unescapeWhitespace(selector);
  return unescapeBackslash(selector);
};

const transformValue = (value: string, aliases?: ParserOptions["aliases"]): string => {
  value = replaceTokens(value, flattenAliases(aliases, "value"), /[\w$#-]+/g);
  value = unescapeWhitespace(value);
  value = value.replace(/\$([_a-zA-Z0-9-]*[a-zA-Z0-9])/g, "var(--$1)");
  return unescapeBackslash(value);
};

const transformProperty = (property: string, aliases?: ParserOptions["aliases"]): string | undefined => {
  if (property.startsWith("--")) {
    return property;
  }
  property = replaceProperty(property, flattenAliases(aliases, "property"));
  if (knownCssPropertySet.has(property)) {
    return property;
  }
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
      properties.push({ name, value: transformValue(match[2], aliases), important: !!match[3] });
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
