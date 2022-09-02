import type { Replacements } from "../core/types.js";
import { mergeReplacements } from "./merge.js";

export const mediaOperatorReplacements: Replacements = {
  media: [
    [/!/g, "not "],
    [/&/g, " and "],
    [/\|/g, " or "],
  ],
};

export const abbreviationReplacements: Replacements = {
  media: [
    [/\bh\b/g, "height"],
    [/\bw\b/g, "width"],
  ],
  property: [
    [/^b$/, "border"],
    [/^bg$/, "background"],
    [/^c$/, "color"],
    [/^d$/, "display"],
    [/^h$/, "height"],
    [/^m$/, "margin"],
    [/^p$/, "padding"],
    [/^pos$/, "position"],
    [/^w$/, "width"],
    [/^z$/, "z-index"],

    [/^b-/, "border-"],
    [/^bg-/, "background-"],
    [/^m-/, "margin-"],
    [/^p-/, "padding-"],

    [/-b$/, "-bottom"],
    [/-c$/, "-color"],
    [/-h$/, "-height"],
    [/-l$/, "-left"],
    [/-r$/, "-right"],
    [/-t$/, "-top"],
    [/-pos$/, "-position"],
    [/-w$/, "-width"],

    [/-b-/, "-bottom-"],
    [/-l-/, "-left-"],
    [/-r-/, "-right-"],
    [/-t-/, "-top-"],
  ],
};

export const defaultReplacements = mergeReplacements(mediaOperatorReplacements, abbreviationReplacements);
