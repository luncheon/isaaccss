const groupToMap = (array, keySelector) => {
    const map = new Map();
    for (const element of array) {
        const key = keySelector(element);
        const values = map.get(key);
        values ? values.push(element) : map.set(key, [element]);
    }
    return map;
};
const joinGroup = (separator, array, groupKeySelector, joinedValueSelector) => {
    const grouped = groupToMap(array, groupKeySelector);
    return [...grouped.keys()]
        .sort()
        .map(key => joinedValueSelector(key, grouped.get(key)))
        .join(separator);
};
const mediaSelector = (c) => c.media ?? "";
const layerSelector = (c) => c.layer;
const selectorSelector = (c) => `.${CSS.escape(c.className)}${":not(#\\ )".repeat(c.specificity ?? 0)}${c.selector ?? ""}`;
const propertySelector = (c) => `${c.property}:${c.value}${c.important ? "!important" : ""}`;
export const cssify = (classes, options) => {
    const [singleIndent, newline] = options?.pretty ? ["  ", "\n"] : ["", ""];
    return joinGroup(newline, classes, mediaSelector, (media, mediaRecords) => {
        const indent1 = media ? singleIndent : "";
        const content = joinGroup(newline, mediaRecords, layerSelector, (layer, layerRecords) => {
            const hasLayer = layer !== undefined;
            const indent2 = indent1 + (hasLayer ? singleIndent : "");
            const content = joinGroup(newline, layerRecords, propertySelector, (propertyList, selectorRecords) => {
                const selector = selectorRecords.sort().map(selectorSelector).join(`,${newline}${indent2}`);
                return `${indent2}${selector}{${newline}${indent2}${singleIndent}${propertyList}${newline}${indent2}}${newline}`;
            });
            return hasLayer ? `${indent1}@layer${layer ? " " : ""}${layer}{${newline}${content}${indent1}}${newline}` : content;
        });
        return media ? `@media${media.startsWith("(") ? "" : " "}${media}{${newline}${content}}${newline}` : content;
    });
};
