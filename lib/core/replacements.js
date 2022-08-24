export const mergeReplacements = (...replacements) => ({
    media: replacements.flatMap(r => r.media ?? []),
    selector: replacements.flatMap(r => r.selector ?? []),
    property: replacements.flatMap(r => r.property ?? []),
    value: replacements.flatMap(r => r.value ?? []),
});
export const mediaOperatorReplacements = {
    media: [
        [/!/g, "not "],
        [/&/g, " and "],
        [/\|/g, " or "],
    ],
};
export const abbreviationReplacements = {
    media: [
        [/\bh\b/g, "height"],
        [/\bw\b/g, "width"],
    ],
    property: [
        [/^b$/, "border"],
        [/^bg$/, "background"],
        [/^d$/, "display"],
        [/^f$/, "font"],
        [/^m$/, "margin"],
        [/^p$/, "padding"],
        [/^z$/, "z-index"],
        [/^a-content$/, "align-content"],
        [/^a-items$/, "align-items"],
        [/^a-self$/, "align-self"],
        [/^j-content$/, "justify-content"],
        [/^j-items$/, "justify-items"],
        [/^j-self$/, "justify-self"],
        [/^p-content$/, "place-content"],
        [/^p-items$/, "place-items"],
        [/^p-self$/, "place-self"],
        [/^v-align$/, "vertical-align"],
        [/\bsz\b/, "size"],
        [/\bpos\b/, "position"],
        [/\bc$/, "color"],
        [/\bh$/, "height"],
        [/\bw$/, "width"],
        [/^b-/, "border-"],
        [/^bg-/, "background-"],
        [/^f-/, "font-"],
        [/^m-/, "margin-"],
        [/^p-/, "padding-"],
        [/^t-/, "text-"],
        [/-b\b/, "-bottom"],
        [/-l\b/, "-left"],
        [/-r\b/, "-right"],
        [/-t\b/, "-top"],
    ],
};
export const nthChildReplacements = {
    // :1/ :2/ :3/ :2n/ :2n+1/
    selector: [[/:(\d+(?:n(?:\+\d+)?)?)\b/g, ":nth-child($1)"]],
};
export const defaultReplacements = mergeReplacements(mediaOperatorReplacements, abbreviationReplacements, nthChildReplacements);
