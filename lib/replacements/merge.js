export const mergeReplacements = (...replacements) => {
    const rs = [].concat(...replacements);
    return {
        media: rs.flatMap(r => r.media ?? []),
        selector: rs.flatMap(r => r.selector ?? []),
        property: rs.flatMap(r => r.property ?? []),
        value: rs.flatMap(r => r.value ?? []),
    };
};
