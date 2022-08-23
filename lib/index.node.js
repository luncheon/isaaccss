import "css.escape";
import fs from "node:fs/promises";
import { parseHtml, parseScript } from "./index.browser.js";
export * from "./index.browser.js";
export const parseFile = async (filename, config, collectTo = new Map()) => {
    if (/\.html?/.test(filename)) {
        return parseHtml(await fs.readFile(filename, "utf8"), config, collectTo);
    }
    const match = filename.match(/\.[cm]?([jt])s(x?)/);
    if (match) {
        return parseScript(await fs.readFile(filename, "utf8"), config, { jsx: !!match[2], typescript: match[1] === "t" }, collectTo);
    }
    throw Error("Unsupported File Extension");
};
