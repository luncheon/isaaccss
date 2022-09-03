import { all as __knownCssProperties } from "known-css-properties";
const knownCssPropertySet = new Set(__knownCssProperties);
const unescapeBackslash = (s) => s.replace(/\\(.)/g, "$1");
const unescapeWhitespace = (s) => s.replace(/(^|[^\\])(\\\\)*_/g, "$1$2 ");
const replaceTokens = (source, replacement, tokenPattern) => {
    if (!replacement) {
        return source;
    }
    if (Array.isArray(replacement)) {
        if (replacement[0] instanceof RegExp) {
            return source.replace(replacement[0], replacement[1]);
        }
        else {
            return replacement.reduce((s, r) => replaceTokens(s, r, tokenPattern), source);
        }
    }
    return source.replaceAll(tokenPattern, token => replacement[token] ?? token);
};
const replaceProperty = (property, replacement) => {
    if (!replacement) {
        return property;
    }
    if (Array.isArray(replacement)) {
        if (replacement[0] instanceof RegExp) {
            return property.replace(replacement[0], replacement[1]);
        }
        else {
            return replacement.reduce(replaceProperty, property);
        }
    }
    return replacement[property] || property;
};
const transformMedia = (media, replacements) => {
    media = replaceTokens(media, replacements, /[\w$#-]+/g);
    media = unescapeWhitespace(media);
    media = media.replace(/(^| )([^ ()]+\b[^ ()]+)($| )/g, "$1($2)$3");
    return unescapeBackslash(media);
};
const transformSelector = (selector, replacements) => {
    selector = replaceTokens(selector, replacements, /([:>+~_]|::)[\w$#-]+/g);
    selector = unescapeWhitespace(selector);
    return unescapeBackslash(selector);
};
const transformValue = (value, replacements) => {
    value = replaceTokens(value, replacements, /[\w$#-]+/g);
    value = unescapeWhitespace(value);
    value = value.replace(/\$([_a-zA-Z0-9-]*[a-zA-Z0-9])/g, "var(--$1)");
    return unescapeBackslash(value);
};
const transformProperty = (property, replacements) => {
    if (property.startsWith("--")) {
        return property;
    }
    property = replaceProperty(property, replacements);
    if (knownCssPropertySet.has(property)) {
        return property;
    }
};
export const parseClass = (className, options) => {
    const replacements = options?.replacements;
    const match = className.match(
    // @media/                   selector/                property:value specificity
    /^(?:@((?:[^/\\]|\\.)+?)\/)?(?:((?:[^/\\]|\\.)+?)\/)?([^:]+?):(.+?)(\**)(!?)(\??)$/);
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
