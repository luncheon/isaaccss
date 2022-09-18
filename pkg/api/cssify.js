import "css.escape";
const groupToMap = (array, keySelector) => {
    const map = new Map();
    for (const element of array) {
        const key = keySelector(element);
        const values = map.get(key);
        values ? values.push(element) : map.set(key, [element]);
    }
    return map;
};
const groupJoin = (separator, elements, groupKeySelector, joinedValueSelector) => {
    const grouped = groupToMap(elements, groupKeySelector);
    return [...grouped.keys()]
        .sort()
        .map(key => joinedValueSelector(key, grouped.get(key)))
        .join(separator);
};
export const cssify = (classes, options) => {
    const [singleIndent, newline] = options?.pretty ? ["  ", "\n"] : ["", ""];
    const indents = [0, 1, 2, 3, 4].map(n => singleIndent.repeat(n));
    const block = (indent, header, body) => header ? `${indents[indent]}${header}{${newline}${body}${indents[indent]}}${newline}` : body;
    const createBlockSelector = (headSelector) => (bodySelector) => (indent, classes) => groupJoin(newline, classes, headSelector, (header, classes) => block(indent, header, bodySelector(indent + (header ? 1 : 0), classes)));
    const mediaSelector = createBlockSelector(({ media }) => (media ? `@media ${media}` : ""));
    const containerSelector = createBlockSelector(({ container }) => (container ? `@container ${container}` : ""));
    const layerSelector = createBlockSelector(({ layer }) => (layer !== undefined ? `@layer${layer ? " " + layer : ""}` : undefined));
    const selectorSelector = (cls) => {
        const selector = cls.selector ?? "";
        const selfSelector = "." + CSS.escape(cls.className) + ":not(#\\ )".repeat(cls.specificity ?? 0);
        return selector.includes("&") ? selector.replaceAll("&", selfSelector) : selfSelector + selector;
    };
    const propertiesSelector = (indent, classes) => groupJoin(newline, classes, cls => cls.properties.map(p => `${indents[indent + 1]}${p.name}:${p.value}${p.important ? "!important" : ""}`).join(";" + newline), (body, classes) => block(indent, classes.map(selectorSelector).join(`,${newline}${indents[indent]}`), body + newline));
    return mediaSelector(containerSelector(layerSelector(propertiesSelector)))(0, classes);
};
