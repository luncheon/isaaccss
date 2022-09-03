import assert from "assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { it } from "node:test";
import { fileURLToPath } from "node:url";
import expected from "./sample/expected.css.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolve = (...segments) => path.resolve(__dirname, ...segments);
const cli = resolve("../lib/cli.js");

const run = (...options) =>
  execFileSync("node", [cli, resolve("sample/**/*.{js,ts,jsx,tsx}"), ...options])
    .toString()
    .trim();

it("cli", () => {
  assert.match(run("-a"), /^isaaccss \[/);
  assert.equal(run(), expected.default);
  assert.equal(run("-c", resolve("sample/isaaccss.config.no-replacements.js")), expected.noReplacements);
  assert.equal(run("-c", resolve("sample/isaaccss.config.open-props.js")), expected.openProps);
});
