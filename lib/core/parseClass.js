import { all as __knownCssProperties } from "known-css-properties";
const knownCssPropertySet = new Set(__knownCssProperties);
function* flattenAliases(aliases, key) {
    if (!aliases) {
        return;
    }
    if (Array.isArray(aliases)) {
        for (const alias of aliases) {
            yield* flattenAliases(alias, key);
        }
        return;
    }
    const alias = aliases[key];
    if (!alias) {
        return;
    }
    if (!Array.isArray(alias) || alias[0] instanceof RegExp) {
        yield alias;
    }
    else {
        for (const a of alias) {
            if (a) {
                yield a;
            }
        }
    }
}
const unescapeBackslash = (s) => s.replace(/\\(.)/g, "$1");
const unescapeWhitespace = (s) => s.replace(/(^|[^\\])(\\\\)*_/g, "$1$2 ");
const replaceTokens = (source, aliases, tokenPattern) => {
    for (const alias of aliases) {
        if (Array.isArray(alias)) {
            source = source.replace(alias[0], alias[1]);
        }
        else {
            source = source.replaceAll(tokenPattern, token => alias[token] ?? token);
        }
    }
    return source;
};
const replaceProperty = (property, aliases) => {
    for (const alias of aliases) {
        if (Array.isArray(alias)) {
            property = property.replace(alias[0], alias[1]);
        }
        else {
            property = alias[property] || property;
        }
    }
    return property;
};
const transformMedia = (media, aliases) => {
    media = replaceTokens(media, flattenAliases(aliases, "media"), /[\w$#-]+/g);
    media = unescapeWhitespace(media);
    media = media.replace(/(^| )([^ ()]+\b[^ ()]+)($| )/g, "$1($2)$3");
    return unescapeBackslash(media);
};
const transformSelector = (selector, aliases) => {
    selector = replaceTokens(selector, flattenAliases(aliases, "selector"), /([:>+~_]|::)[\w$#-]+/g);
    selector = unescapeWhitespace(selector);
    return unescapeBackslash(selector);
};
const transformValue = (value, aliases) => {
    value = replaceTokens(value, flattenAliases(aliases, "value"), /[\w$#-]+/g);
    value = unescapeWhitespace(value);
    value = value.replace(/\$([_a-zA-Z0-9-]*[a-zA-Z0-9])/g, "var(--$1)");
    return unescapeBackslash(value);
};
const transformProperty = (property, aliases) => {
    if (property.startsWith("--")) {
        return property;
    }
    property = replaceProperty(property, flattenAliases(aliases, "property"));
    if (knownCssPropertySet.has(property)) {
        return property;
    }
};
export const parseClass = (className, options) => {
    const aliases = options?.aliases;
    const match = className.match(
    // @media/                   selector/                property:value specificity
    /^(?:@((?:[^/\\]|\\.)+?)\/)?(?:((?:[^/\\]|\\.)+?)\/)?([^:]+?):(.+?)(\**)(!?)(\??)$/);
    const property = match && transformProperty(match[3], aliases);
    return property
        ? {
            className,
            media: match[1] ? transformMedia(match[1], aliases) : undefined,
            layer: match[7] === "?" ? "" : undefined,
            selector: match[2] ? transformSelector(match[2], aliases) : undefined,
            specificity: (match[7] === "?" ? 0 : 1) + match[5].length,
            properties: [
                {
                    name: property,
                    value: transformValue(match[4], aliases),
                    important: match[6] === "!",
                },
            ],
        }
        : undefined;
};
