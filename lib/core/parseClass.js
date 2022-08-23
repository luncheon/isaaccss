const preTransform = (s) => s?.replace(/([^\\])_/g, "$1 ");
const postTransform = (s) => s?.replace(/\\(.)/g, "$1");
const transformMedia = (media, config) => {
    media = preTransform(media);
    if (media) {
        for (const [search, replacer] of config.replace) {
            media = typeof replacer === "function" ? media.replace(search, (...args) => replacer(args)) : media.replace(search, replacer);
        }
        media = media.replace(/(^| )([^ ()]+\b[^ ()]+)($| )/g, "$1($2)$3");
    }
    return postTransform(media);
};
const transformProperty = (property, config) => {
    for (const [search, replacer] of config.replace) {
        property = property.replace(search, replacer);
    }
    if (property.startsWith("--") || config.known.has(property)) {
        return property;
    }
};
const transformValue = (value, config) => {
    value = preTransform(value);
    if (value) {
        for (const [search, replacer] of config.replace) {
            value = typeof replacer === "function" ? value.replace(search, (...args) => replacer(args)) : value.replace(search, replacer);
        }
    }
    return postTransform(value);
};
export const parseClass = (className, config, collectTo = new Map()) => {
    for (const s of className.split(" ")) {
        const match = !collectTo.has(s) &&
            //        @media/                   selector/                property:value specificity
            s.match(/^(?:@((?:[^/\\]|\\.)+?)\/)?(?:((?:[^/\\]|\\.)+?)\/)?([^:]+?):(.+?)(\**)(!?)(\??)$/);
        const property = match && transformProperty(match[3], config.property);
        property &&
            collectTo.set(s, {
                className: s,
                media: transformMedia(match[1], config.media),
                layer: match[7] === "?" ? "" : undefined,
                selector: transformValue(match[2], config.selector),
                property,
                value: transformValue(match[4], config.value),
                specificity: (match[7] === "?" ? 0 : config.specificity.default) + match[5].length,
                important: match[6] === "!" || undefined,
            });
    }
    return collectTo;
};
