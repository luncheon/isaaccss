export const mergeReplacements = (...replacements) => ({
    media: replacements.flatMap(r => r.media ?? []),
    selector: replacements.flatMap(r => r.selector ?? []),
    property: replacements.flatMap(r => r.property ?? []),
    value: replacements.flatMap(r => r.value ?? []),
});
