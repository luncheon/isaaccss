import { all as __knownCssProperties } from "known-css-properties";
const knownCssPropertySet = new Set(__knownCssProperties);
const unescape = (s) => s.replace(/\\(.)/g, "$1");
const replace = (s, replacements) => {
    s = s.replace(/(^|[^\\])_/g, "$1 ");
    for (const [search, replacer] of replacements ?? []) {
        s = typeof replacer === "function" ? s.replace(search, (...args) => replacer(args)) : s.replace(search, replacer);
    }
    return s;
};
const transformMedia = (media, replacements) => media && unescape(replace(media, replacements).replace(/(^| )([^ ()]+\b[^ ()]+)($| )/g, "$1($2)$3"));
const transformSelector = (selector, replacements) => selector && unescape(replace(selector, replacements));
const transformValue = (value, replacements) => unescape(replace(value, replacements).replace(/(^|[^\\])\$([a-zA-Z_-]+)/g, "$1var(--$2)"));
const transformProperty = (property, replacements) => {
    for (const [search, replacer] of replacements ?? []) {
        property = property.replace(search, replacer);
    }
    if (property.startsWith("--") || knownCssPropertySet.has(property)) {
        return property;
    }
};
export const parseClass = (className, options, collectTo = new Map()) => {
    const replacements = options?.replacements;
    for (const s of className.split(" ")) {
        const match = !collectTo.has(s) &&
            //        @media/                   selector/                property:value specificity
            s.match(/^(?:@((?:[^/\\]|\\.)+?)\/)?(?:((?:[^/\\]|\\.)+?)\/)?([^:]+?):(.+?)(\**)(!?)(\??)$/);
        const property = match && transformProperty(match[3], replacements?.property);
        property &&
            collectTo.set(s, {
                className: s,
                media: transformMedia(match[1], replacements?.media),
                layer: match[7] === "?" ? "" : undefined,
                selector: transformSelector(match[2], replacements?.selector),
                property,
                value: transformValue(match[4], replacements?.value),
                specificity: (match[7] === "?" ? 0 : 1) + match[5].length,
                important: match[6] === "!" || undefined,
            });
    }
    return collectTo;
};
