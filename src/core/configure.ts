import type { IsaaccssConfig, IsaaccssConfigSource } from "./types.js";

export const configure = (config: IsaaccssConfigSource, ...configs: readonly IsaaccssConfigSource[]): IsaaccssConfig => {
  const result = {
    media: { replace: new Map(config.media?.replace) },
    selector: { replace: new Map(config.selector?.replace) },
    property: { replace: new Map(config.property?.replace), known: new Set(config.property?.known) },
    value: { replace: new Map(config.value?.replace) },
    specificity: { default: config.specificity?.default ?? 1 },
  };
  for (const c of configs) {
    for (const entry of c.media?.replace ?? []) {
      result.media.replace.set(entry[0], entry[1]);
    }
    for (const entry of c.selector?.replace ?? []) {
      result.selector.replace.set(entry[0], entry[1]);
    }
    for (const entry of c.property?.replace ?? []) {
      result.property.replace.set(entry[0], entry[1]);
    }
    for (const s of c.property?.known ?? []) {
      result.property.known.add(s);
    }
    for (const entry of c.value?.replace ?? []) {
      result.value.replace.set(entry[0], entry[1]);
    }
    if (c.specificity?.default !== undefined) {
      result.specificity.default = c.specificity?.default;
    }
  }
  return result;
};
