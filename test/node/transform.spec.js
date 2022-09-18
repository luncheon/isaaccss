import { transform } from "isaaccss/api/transform.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("transform", () => {
  it("compress", () => {
    const actual = s => transform(`import {is} from "isaaccss";is\`${s}\`;`, "", { compress: true });
    assert.deepEqual(actual(""), { code: "``;", classes: new Map() });
    assert.deepEqual(actual("x:0"), { code: "`#a`;", classes: new Map([["x:0", { specificity: 1, unknownProperties: [], className: "#a", properties: [{ name: "x", value: "0", important: false }] }]]) });
    assert.deepEqual(actual(" x:0"), { code: "`#a`;", classes: new Map([["x:0", { specificity: 1, unknownProperties: [], className: "#a", properties: [{ name: "x", value: "0", important: false }] }]]) });
    assert.deepEqual(actual("x:0 "), { code: "`#a`;", classes: new Map([["x:0", { specificity: 1, unknownProperties: [], className: "#a", properties: [{ name: "x", value: "0", important: false }] }]]) });
    assert.deepEqual(actual(" x:0 "), { code: "`#a`;", classes: new Map([["x:0", { specificity: 1, unknownProperties: [], className: "#a", properties: [{ name: "x", value: "0", important: false }] }]]) });
    assert.deepEqual(actual("x:0 y:1!"), {
      code: "`#a #b`;",
      classes: new Map([
        ["x:0", { specificity: 1, unknownProperties: [], className: "#a", properties: [{ name: "x", value: "0", important: false }] }],
        ["y:1!", { specificity: 1, unknownProperties: [], className: "#b", properties: [{ name: "y", value: "1", important: true }] }],
      ]),
    });
    assert.deepEqual(actual("  x:0  y:1!  "), {
      code: "`#a #b`;",
      classes: new Map([
        ["x:0", { specificity: 1, unknownProperties: [], className: "#a", properties: [{ name: "x", value: "0", important: false }] }],
        ["y:1!", { specificity: 1, unknownProperties: [], className: "#b", properties: [{ name: "y", value: "1", important: true }] }],
      ]),
    });
    assert.deepEqual(actual("${1}${2}x:0${3}${4}"), { code: "`${1} ${2} #a ${3} ${4}`;", classes: new Map([["x:0", { specificity: 1, unknownProperties: [], className: "#a", properties: [{ name: "x", value: "0", important: false }] }]]) });
    assert.deepEqual(actual("  ${1}  ${2}  \n  x:0  ${3}  ${4}  \n  "), { code: "`${1} ${2} #a ${3} ${4}`;", classes: new Map([["x:0", { specificity: 1, unknownProperties: [], className: "#a", properties: [{ name: "x", value: "0", important: false }] }]]) });
  });
});
