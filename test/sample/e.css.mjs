import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export default {
  get default() {
    return fs.readFileSync(require.resolve("./expected-default.css"), "utf8");
  },
  get noReplacements() {
    return fs.readFileSync(require.resolve("./expected-no-replacements.css"), "utf8");
  },
};
