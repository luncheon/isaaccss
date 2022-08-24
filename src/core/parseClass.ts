import type { IsaacClass, IsaacClasses, IsaacConfig, IsaacReplacerFunction } from "./types.js";

const unescape = (s: string) => s.replace(/\\(.)/g, "$1");

const replace = (s: string, config: Map<RegExp, string | IsaacReplacerFunction>) => {
  s = s.replace(/(^|[^\\])_/g, "$1 ");
  for (const [search, replacer] of config) {
    s = typeof replacer === "function" ? s.replace(search, (...args) => replacer(args)) : s.replace(search, replacer);
  }
  return s;
};

const transformMedia = (media: string | undefined, config: IsaacConfig["value"]): string | undefined =>
  media && unescape(replace(media, config.replace).replace(/(^| )([^ ()]+\b[^ ()]+)($| )/g, "$1($2)$3"));

const transformSelector = (selector: string | undefined, config: IsaacConfig["selector"]): string | undefined =>
  selector && unescape(replace(selector, config.replace));

const transformValue = (value: string, config: IsaacConfig["value"]): string =>
  unescape(replace(value, config.replace).replace(/(^|[^\\])\$([a-zA-Z_-]+)/g, "$1var(--$2)"));

const transformProperty = (property: string, config: IsaacConfig["property"]): string | undefined => {
  for (const [search, replacer] of config.replace) {
    property = property.replace(search, replacer);
  }
  if (property.startsWith("--") || config.known.has(property)) {
    return property;
  }
};

export const parseClass = (className: string, config: IsaacConfig, collectTo = new Map<string, IsaacClass>()): IsaacClasses => {
  for (const s of className.split(" ")) {
    const match =
      !collectTo.has(s) &&
      //        @media/                   selector/                property:value specificity
      s.match(/^(?:@((?:[^/\\]|\\.)+?)\/)?(?:((?:[^/\\]|\\.)+?)\/)?([^:]+?):(.+?)(\**)(!?)(\??)$/);
    const property = match && transformProperty(match[3], config.property);
    property &&
      collectTo.set(s, {
        className: s,
        media: transformMedia(match[1], config.media),
        layer: match[7] === "?" ? "" : undefined,
        selector: transformSelector(match[2], config.selector),
        property,
        value: transformValue(match[4], config.value),
        specificity: (match[7] === "?" ? 0 : config.specificity.default) + match[5].length,
        important: match[6] === "!" || undefined,
      });
  }
  return collectTo;
};
