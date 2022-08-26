import type { Replacements } from "../core/types.js";

export const mergeReplacements = (...replacements: readonly (Replacements | readonly Replacements[])[]): Replacements => {
  const rs = ([] as Replacements[]).concat(...replacements);
  return {
    media: rs.flatMap(r => r.media ?? []),
    selector: rs.flatMap(r => r.selector ?? []),
    property: rs.flatMap(r => r.property ?? []),
    value: rs.flatMap(r => r.value ?? []),
  };
};
