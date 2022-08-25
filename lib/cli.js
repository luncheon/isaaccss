#!/usr/bin/env node
import glob from "glob";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { parseArgs } from "node:util";
import { cssify, defaultReplacements, parseClass, parseHtml, parseScript } from "./index.node.js";
const parseFile = async (filename, config, collectTo = new Map()) => {
    if (/\.html?/.test(filename)) {
        return parseHtml(await fs.promises.readFile(filename, "utf8"), config, collectTo);
    }
    const match = filename.match(/\.[cm]?([jt])s(x?)/);
    if (match) {
        return parseScript(await fs.promises.readFile(filename, "utf8"), config, { jsx: !!match[2], typescript: match[1] === "t" }, collectTo);
    }
    console.warn(`ignore file: ${filename}`);
    return collectTo;
};
const interact = async (config) => {
    process.stdout.write("> ");
    for await (const line of readline.createInterface({ input: process.stdin, output: process.stdout })) {
        console.log(cssify(parseClass(line, config), config));
        process.stdout.write("> ");
    }
    console.log();
};
let args;
try {
    args = parseArgs({
        allowPositionals: true,
        options: {
            config: { type: "string", short: "c" },
            output: { type: "string", short: "o" },
            pretty: { type: "boolean" },
        },
    });
}
catch {
    console.log(`
isaaccss [-c config.js] [-o output.css] [--pretty] [target...]

  --config, -c      Configuration script filename.
                    If unspecified, "isaaccss.config.js" of the current directory is used.
  --output, -o      Output css filename. Console if unspecified.
  --pretty          Pretty print.
  target            Glob pattern with /\\.html/ or /\\.[cm]?[jt]sx?/ extension.
                    Interactive mode if unspecified.
`);
}
if (args) {
    const configFilename = path.join(process.cwd(), args.values.config || "isaaccss.config.js");
    const importedConfig = args.values.config || fs.existsSync(configFilename) ? (await import(configFilename)).default : undefined;
    const config = {
        replacements: importedConfig?.replacements ?? defaultReplacements,
        pretty: importedConfig?.pretty || args.values.pretty,
    };
    if (args.positionals.length === 0) {
        interact(config);
    }
    else {
        const classes = new Map();
        await Promise.all(args.positionals.flatMap(pattern => glob.sync(pattern)).map(filename => parseFile(filename, config, classes)));
        const css = cssify(classes, config);
        if (args.values.output) {
            await fs.promises.writeFile(args.values.output, css, "utf8");
        }
        else {
            console.log(css);
        }
    }
}
