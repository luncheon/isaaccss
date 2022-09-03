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
  media: {
    h: "height",
    "min-h": "min-height",
    "max-h": "max-height",
    w: "width",
    "min-w": "min-width",
    "max-w": "max-width",
  },
  property: [
    {
      b: "border",
      bg: "background",
      c: "color",
      d: "display",
      h: "height",
      m: "margin",
      p: "padding",
      pos: "position",
      w: "width",
      z: "z-index",
    },

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
