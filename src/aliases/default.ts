import type { Aliases } from "../api/types.js";

export const mediaOperatorAliases: Aliases = {
  media: [
    [/!/g, "not "],
    [/&/g, " and "],
    [/\|/g, " or "],
  ],
};

export const abbreviationAliases: Aliases = {
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

    [/\b(border|margin|padding)-x\b/, ["$1-left", "$1-right"]],
    [/\b(border|margin|padding)-y\b/, ["$1-top", "$1-bottom"]],

    {
      // b-b-radius, b-l-radius, b-r-radius, b-t-radius
      "border-bottom-radius": ["border-bottom-left-radius", "border-bottom-right-radius"],
      "border-left-radius": ["border-top-left-radius", "border-bottom-left-radius"],
      "border-right-radius": ["border-top-right-radius", "border-bottom-right-radius"],
      "border-top-radius": ["border-top-left-radius", "border-top-right-radius"],
    },
  ],
};

export const defaultAliases = [mediaOperatorAliases, abbreviationAliases];
