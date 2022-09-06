import { all as __knownCssProperties } from "known-css-properties";
import type { ParserOptions, Replacement, Replacements } from "./types.js";

const knownCssPropertySet = new Set(__knownCssProperties);

const unescapeBackslash = (s: string) => s.replace(/\\(.)/g, "$1");
const unescapeWhitespace = (s: string) => s.replace(/(^|[^\\])(\\\\)*_/g, "$1$2 ");

const replaceTokens = (source: string, replacement: Replacement, tokenPattern: RegExp): string => {
  if (!replacement) {
    return source;
  }
  if (Array.isArray(replacement)) {
    if (replacement[0] instanceof RegExp) {
      return source.replace(replacement[0], replacement[1] as any);
    } else {
      return replacement.reduce((s, r) => replaceTokens(s, r, tokenPattern), source);
    }
  }
  return source.replaceAll(tokenPattern, token => (replacement as { readonly [token in string]: string })[token] ?? token);
};

const replaceProperty = (property: string, replacement: Replacement): string => {
  if (!replacement) {
    return property;
  }
  if (Array.isArray(replacement)) {
    if (replacement[0] instanceof RegExp) {
      return property.replace(replacement[0], replacement[1] as any);
    } else {
      return replacement.reduce(replaceProperty, property);
    }
  }
  return (replacement as { readonly [token in string]: string })[property] || property;
};

const transformMedia = (media: string, replacements?: Replacements["value"]): string => {
  media = replaceTokens(media, replacements, /[\w$#-]+/g);
  media = unescapeWhitespace(media);
  media = media.replace(/(^| )([^ ()]+\b[^ ()]+)($| )/g, "$1($2)$3");
  return unescapeBackslash(media);
};

const transformSelector = (selector: string, replacements?: Replacements["selector"]): string => {
  selector = replaceTokens(selector, replacements, /([:>+~_]|::)[\w$#-]+/g);
  selector = unescapeWhitespace(selector);
  return unescapeBackslash(selector);
};

const transformValue = (value: string, replacements?: Replacements["value"]): string => {
  value = replaceTokens(value, replacements, /[\w$#-]+/g);
  value = unescapeWhitespace(value);
  value = value.replace(/\$([_a-zA-Z0-9-]*[a-zA-Z0-9])/g, "var(--$1)");
  return unescapeBackslash(value);
};

const transformProperty = (property: string, replacements?: Replacements["property"]): string | undefined => {
  if (property.startsWith("--")) {
    return property;
  }
  property = replaceProperty(property, replacements);
  if (knownCssPropertySet.has(property)) {
    return property;
  }
};

export const parseClass = (className: string, options?: ParserOptions) => {
  const replacements = options?.replacements;
  const match = className.match(
    // @media/                   selector/                property:value specificity
    /^(?:@((?:[^/\\]|\\.)+?)\/)?(?:((?:[^/\\]|\\.)+?)\/)?([^:]+?):(.+?)(\**)(!?)(\??)$/,
  );
  const property = match && transformProperty(match[3], replacements?.property);
  return property
    ? {
        className,
        media: match[1] ? transformMedia(match[1], replacements?.media) : undefined,
        layer: match[7] === "?" ? "" : undefined,
        selector: match[2] ? transformSelector(match[2], replacements?.selector) : undefined,
        property,
        value: transformValue(match[4], replacements?.value),
        specificity: (match[7] === "?" ? 0 : 1) + match[5].length,
        important: match[6] === "!" || undefined,
      }
    : undefined;
};
