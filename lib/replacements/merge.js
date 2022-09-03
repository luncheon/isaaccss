export const mergeReplacements = (...replacements) => {
    const rs = [].concat(...replacements);
    return {
        media: rs.map(r => r.media),
        selector: rs.map(r => r.selector),
        property: rs.map(r => r.property),
        value: rs.map(r => r.value),
    };
};
