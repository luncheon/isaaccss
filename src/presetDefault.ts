import { all as knownCssProperties } from "known-css-properties";
import { configure } from "./configure";

export const presetDefault = configure({
  media: {
    replace: [
      ["!", "not "],
      ["&", " and "],
      ["|", " or "],
      ["h", "height"],
      ["w", "width"],
      [/(^| )([^ ()]+\b[^ ()]+)($| )/g, "$1($2)$3"],
    ],
  },
  selector: {
    replace: [
      [/::a\b/g, "::after"],
      [/::b\b/g, "::before"],
      [/:(\d+)\b/g, match => (match[1] === "1" ? ":first-child" : `:nth-child(${match[1]})`)],
    ],
  },
  property: {
    known: knownCssProperties,
    replace: [
      ["b", "border"],
      ["bg", "background"],
      ["d", "display"],
      ["f", "font"],
      ["m", "margin"],
      ["p", "padding"],
      ["z", "z-index"],

      ["a-content", "align-content"],
      ["a-items", "align-items"],
      ["a-self", "align-self"],
      ["j-content", "justify-content"],
      ["j-items", "justify-items"],
      ["j-self", "justify-self"],
      ["p-content", "place-content"],
      ["p-items", "place-items"],
      ["p-self", "place-self"],
      ["v-align", "vertical-align"],

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
  },
  value: {
    replace: [
      ["i-flex", "inline-flex"],
      ["i-grid", "inline-grid"],
      [/\$([a-zA-Z_-]+)/g, "var(--$1)"],
    ],
  },
});
