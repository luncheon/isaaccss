import assert from "assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import expected from "./sample/expected.css.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolve = (...segments) => path.resolve(__dirname, ...segments);
const cli = resolve("../lib/cli.js");

const run = (...options) =>
  execFileSync("node", [cli, resolve("sample/**/*.{js,ts,jsx,tsx}"), ...options])
    .toString()
    .trim();

describe("cli", () => {
  it("show usage when unknown options exists", () => assert.match(run("-a"), /^isaaccss \[/));
  it("default config", () => assert.equal(run(), expected.default));
  it("no replacements", () => assert.equal(run("-c", resolve("sample/empty.config.mjs")), expected.noReplacements));
});
