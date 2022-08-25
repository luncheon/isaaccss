import type { Replacements } from "../core/types.js";

export const mergeReplacements = (...replacements: readonly Replacements[]): Replacements => ({
  media: replacements.flatMap(r => r.media ?? []),
  selector: replacements.flatMap(r => r.selector ?? []),
  property: replacements.flatMap(r => r.property ?? []),
  value: replacements.flatMap(r => r.value ?? []),
});
