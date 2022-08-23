import escapeStringRegexp from "escape-string-regexp";
import type { IsaacConfig, IsaacClass } from "./types";

const preTransform = (s: string | undefined) => s?.replace(/([^\\])_/g, "$1 ");
const postTransform = (s: string | undefined) => s?.replace(/\\(.)/g, "$1");

const transformProperty = (property: string, config: IsaacConfig["property"]): string | undefined => {
  for (const [search, replacer] of config.replace) {
    if (search instanceof RegExp) {
      property = property.replace(search, replacer);
    } else if (property === search) {
      property = replacer;
    }
  }
  if (!config.known || property.startsWith("--") || config.known.has(property)) {
    return property;
  }
};

const transformValue = (value: string | undefined, config: IsaacConfig["value"]): string | undefined => {
  value = preTransform(value);
  if (value) {
    for (const [search, replacer] of config.replace) {
      const pattern = search instanceof RegExp ? search : new RegExp(`\\b${escapeStringRegexp(search)}\\b`, "g");
      value = typeof replacer === "function" ? value.replaceAll(pattern, (...args) => replacer(args)) : value.replaceAll(pattern, replacer);
    }
  }
  return postTransform(value)!;
};

export const parseClass = (className: string, config: IsaacConfig, classes = new Map<string, IsaacClass>()): Map<string, IsaacClass> => {
  for (const s of className.split(" ")) {
    const match =
      !classes.has(s) &&
      //        @media/                   selector/                property:value specificity
      s.match(/^(?:@((?:[^/\\]|\\.)+?)\/)?(?:((?:[^/\\]|\\.)+?)\/)?([^:]+?):(.+?)(\**)(!?)(\??)$/);
    const property = match && transformProperty(match[3], config.property);
    property &&
      classes.set(s, {
        className: s,
        media: transformValue(match[1], config.media),
        layer: match[7] === "?" ? "" : undefined,
        selector: transformValue(match[2], config.selector),
        property,
        value: transformValue(match[4], config.value)!,
        specificity: (match[7] === "?" ? 0 : config.specificity.default) + match[5].length,
        important: match[6] === "!" || undefined,
      });
  }
  return classes;
};
