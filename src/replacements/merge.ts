import type { Replacements } from "../core/types.js";

export const mergeReplacements = (...replacements: readonly (Replacements | readonly Replacements[])[]): Replacements => {
  const rs = ([] as Replacements[]).concat(...replacements);
  return {
    media: rs.map(r => r.media),
    selector: rs.map(r => r.selector),
    property: rs.map(r => r.property),
    value: rs.map(r => r.value),
  };
};
