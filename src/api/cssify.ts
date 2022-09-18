import "css.escape";
import type { CssClass, CssifyOptions } from "./types.js";

const groupToMap = <T, K>(array: Iterable<T>, keySelector: (element: T) => K): Map<K, T[]> => {
  const map = new Map<K, T[]>();
  for (const element of array) {
    const key = keySelector(element);
    const values = map.get(key);
    values ? values.push(element) : map.set(key, [element]);
  }
  return map;
};

const groupJoin = <T, K>(
  separator: string,
  elements: Iterable<T>,
  groupKeySelector: (element: T) => K,
  joinedValueSelector: (key: K, elements: T[]) => string,
) => {
  const grouped = groupToMap(elements, groupKeySelector);
  return [...grouped.keys()]
    .sort()
    .map(key => joinedValueSelector(key, grouped.get(key)!))
    .join(separator);
};

type Classes = Iterable<CssClass>;

export const cssify = (classes: Classes, options?: CssifyOptions): string => {
  const [singleIndent, newline] = options?.pretty ? ["  ", "\n"] : ["", ""];
  const indents = [0, 1, 2, 3, 4].map(n => singleIndent.repeat(n));

  const block = (indent: number, header: string | undefined, body: string) =>
    header ? `${indents[indent]}${header}{${newline}${body}${indents[indent]}}${newline}` : body;

  const createBlockSelector =
    (headSelector: (cls: CssClass) => string | undefined) =>
    (bodySelector: (indent: number, classes: Classes) => string) =>
    (indent: number, classes: Classes): string =>
      groupJoin(newline, classes, headSelector, (header, classes) =>
        block(indent, header, bodySelector(indent + (header ? 1 : 0), classes)),
      );

  const mediaSelector = createBlockSelector(({ media }) => (media ? `@media ${media}` : ""));
  const containerSelector = createBlockSelector(({ container }) => (container ? `@container ${container}` : ""));
  const layerSelector = createBlockSelector(({ layer }) => (layer !== undefined ? `@layer${layer ? " " + layer : ""}` : undefined));

  const selectorSelector = (cls: CssClass) => {
    const selector = cls.selector ?? "";
    const selfSelector = "." + CSS.escape(cls.className) + ":not(#\\ )".repeat(cls.specificity ?? 0);
    return selector.includes("&") ? selector.replaceAll("&", selfSelector) : selfSelector + selector;
  };

  const propertiesSelector = (indent: number, classes: Classes) =>
    groupJoin(
      newline,
      classes,
      cls => cls.properties.map(p => `${indents[indent + 1]}${p.name}:${p.value}${p.important ? "!important" : ""}`).join(";" + newline),
      (body, classes) => block(indent, classes.map(selectorSelector).join(`,${newline}${indents[indent]}`), body + newline),
    );

  return mediaSelector(containerSelector(layerSelector(propertiesSelector)))(0, classes);
};
