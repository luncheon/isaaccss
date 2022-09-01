import { all as __knownCssProperties } from "known-css-properties";
import type { ParserOptions, Replacements, ReplacerFunction } from "./types.js";

const knownCssPropertySet = new Set(__knownCssProperties);

const unescape = (s: string) => s.replace(/\\(.)/g, "$1");

const replace = (s: string, replacements?: Iterable<readonly [RegExp, string | ReplacerFunction]>) => {
  for (const [search, replacer] of replacements ?? []) {
    s = typeof replacer === "function" ? s.replace(search, (...args) => replacer(args)) : s.replace(search, replacer);
  }
  return s.replace(/(^|[^\\])(\\\\)*_/g, "$1$2 ");
};

const transformMedia = (media: string | undefined, replacements?: Replacements["value"]): string | undefined =>
  media && unescape(replace(media, replacements).replace(/(^| )([^ ()]+\b[^ ()]+)($| )/g, "$1($2)$3"));

const transformSelector = (selector: string | undefined, replacements?: Replacements["selector"]): string | undefined =>
  selector && unescape(replace(selector, replacements));

const transformValue = (value: string, replacements?: Replacements["value"]): string =>
  unescape(replace(value, replacements).replace(/\$([a-zA-Z-]*[a-zA-Z])/g, "var(--$1)"));

const transformProperty = (property: string, replacements?: Replacements["property"]): string | undefined => {
  if (property.startsWith("--")) {
    return property;
  }
  for (const [search, replacer] of replacements ?? []) {
    property = property.replace(search, replacer);
  }
  if (knownCssPropertySet.has(property)) {
    return property;
  }
};

export const parseClass = (className: string, options?: ParserOptions) => {
  const replacements = options?.replacements;
  const match = className.match(
    // @media/                   selector/                property:value specificity
    /^(?:@((?:[^/\\]|\\.)+?)\/)?(?:((?:[^/\\]|\\.)+?)\/)?([^:]+?):(.+?)(\**)(!?)(\??)$/
  );
  const property = match && transformProperty(match[3], replacements?.property);
  return property
    ? {
        className,
        media: transformMedia(match[1], replacements?.media),
        layer: match[7] === "?" ? "" : undefined,
        selector: transformSelector(match[2], replacements?.selector),
        property,
        value: transformValue(match[4], replacements?.value),
        specificity: (match[7] === "?" ? 0 : 1) + match[5].length,
        important: match[6] === "!" || undefined,
      }
    : undefined;
};
