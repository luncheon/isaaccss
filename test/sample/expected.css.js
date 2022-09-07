import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const resetCss = fs.readFileSync(require.resolve("./reset.css"), "utf8");

export default {
  get reset() {
    return resetCss;
  },
  get abc() {
    return fs.readFileSync(require.resolve("./expected-abc.css"), "utf8");
  },
  get default() {
    return fs.readFileSync(require.resolve("./expected-default.css"), "utf8");
  },
  get noAliases() {
    return fs.readFileSync(require.resolve("./expected-no-aliases.css"), "utf8");
  },
  get openProps() {
    return fs.readFileSync(require.resolve("./expected-open-props.css"), "utf8");
  },
};
