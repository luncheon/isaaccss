import type { IsaacClass } from "./types";

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
  joinedValueSelector: (key: K, elements: T[]) => string
) => {
  const grouped = groupToMap(array, groupKeySelector);
  return [...grouped.keys()]
    .sort()
    .map(key => joinedValueSelector(key, grouped.get(key)!))
    .join(separator);
};

const mediaSelector = (c: IsaacClass) => c.media ?? "";
const layerSelector = (c: IsaacClass) => c.layer;
const selectorSelector = (c: IsaacClass) => `.${CSS.escape(c.className)}${":not(#\\0)".repeat(c.specificity ?? 0)}${c.selector ?? ""}`;
const propertyListSelector = (c: IsaacClass) => `${c.property}:${c.value}${c.important ? "!important" : ""}`;

export const cssify = (classes: ReadonlyMap<string, IsaacClass>, options?: { pretty?: boolean }): string => {
  const [singleIndent, newline] = options?.pretty ? ["  ", "\n"] : ["", ""];
  return joinGroup(newline, classes.values(), mediaSelector, (media, mediaRecords) => {
    const indent1 = media ? singleIndent : "";
    const content = joinGroup(newline, mediaRecords, layerSelector, (layer, layerRecords) => {
      const hasLayer = layer !== undefined;
      const indent2 = indent1 + (hasLayer ? singleIndent : "");
      const content = joinGroup(newline, layerRecords, propertyListSelector, (propertyList, selectorRecords) => {
        const selector = selectorRecords.sort().map(selectorSelector).join(`,${newline}${indent2}`);
        return `${indent2}${selector}{${newline}${indent2}${singleIndent}${propertyList}${newline}${indent2}}${newline}`;
      });
      return hasLayer ? `${indent1}@layer${layer ? " " : ""}${layer}{${newline}${content}${indent1}}${newline}` : content;
    });
    return media ? `@media${media.startsWith("(") ? "" : " "}${media}{${newline}${content}}${newline}` : content;
  });
};
