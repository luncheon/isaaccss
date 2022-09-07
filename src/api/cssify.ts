import "css.escape";
import type { CssifyOptions, Style } from "./types.js";

const groupToMap = <T, K>(array: readonly T[] | Iterable<T>, keySelector: (element: T) => K): Map<K, T[]> => {
  const map = new Map<K, T[]>();
  for (const element of array) {
    const key = keySelector(element);
    const values = map.get(key);
    values ? values.push(element) : map.set(key, [element]);
  }
  return map;
};

const joinGroup = <T, K>(
  separator: string,
  array: readonly T[] | Iterable<T>,
  groupKeySelector: (element: T) => K,
  joinedValueSelector: (key: K, elements: T[]) => string,
) => {
  const grouped = groupToMap(array, groupKeySelector);
  return [...grouped.keys()]
    .sort()
    .map(key => joinedValueSelector(key, grouped.get(key)!))
    .join(separator);
};

const mediaSelector = (c: Style) => c.media ?? "";
const layerSelector = (c: Style) => c.layer;
const selectorSelector = (c: Style) => `.${CSS.escape(c.className)}${":not(#\\ )".repeat(c.specificity ?? 0)}${c.selector ?? ""}`;
const propertiesSelector = (indent: string, newline: string) => (c: Style) =>
  c.properties.map(p => `${indent}${p.name}:${p.value}${p.important ? "!important" : ""}`).join(newline);

export const cssify = (classes: Iterable<Style>, options?: CssifyOptions): string => {
  const [singleIndent, newline] = options?.pretty ? ["  ", "\n"] : ["", ""];
  return joinGroup(newline, classes, mediaSelector, (media, mediaRecords) => {
    const indent1 = media ? singleIndent : "";
    const content = joinGroup(newline, mediaRecords, layerSelector, (layer, layerRecords) => {
      const hasLayer = layer !== undefined;
      const indent2 = indent1 + (hasLayer ? singleIndent : "");
      const indent3 = indent2 + singleIndent;
      const content = joinGroup(newline, layerRecords, propertiesSelector(indent3, newline), (properties, selectorRecords) => {
        const selector = selectorRecords.sort().map(selectorSelector).join(`,${newline}${indent2}`);
        return `${indent2}${selector}{${newline}${properties}${newline}${indent2}}${newline}`;
      });
      return hasLayer ? `${indent1}@layer${layer ? " " : ""}${layer}{${newline}${content}${indent1}}${newline}` : content;
    });
    return media ? `@media ${media}{${newline}${content}}${newline}` : content;
  });
};
