import glob from "glob";
import fs from "node:fs/promises";
import { stdin, stdout } from "node:process";
import readline from "node:readline/promises";
import { parseArgs } from "node:util";
import { cssify, defaultReplacements, parseClass, parseHtml, parseScript, Replacements, Style } from "./index.node.js";

const parseFile = async (filename: string, replacements: Replacements, collectTo = new Map<string, Style>()) => {
  if (/\.html?/.test(filename)) {
    return parseHtml(await fs.readFile(filename, "utf8"), replacements, collectTo);
  }
  const match = filename.match(/\.[cm]?([jt])s(x?)/);
  if (match) {
    return parseScript(await fs.readFile(filename, "utf8"), replacements, { jsx: !!match[2], typescript: match[1] === "t" }, collectTo);
  }
  console.warn(`ignore file: ${filename}`);
  return collectTo;
};

let args;
try {
  args = parseArgs({
    allowPositionals: true,
    options: {
      output: { type: "string", short: "o" },
      pretty: { type: "boolean" },
    },
  });
} catch {
  console.log(`
isaaccss [--pretty] [-o output.css] [target...]

  --pretty          pretty print
  --output, -o      output css filename
  target            glob pattern with /\\.html/ or /\\.[cm]?[jt]sx?/ extension
`);
}

if (args) {
  const replacements = defaultReplacements;
  const cssifyOptions = { pretty: args.values.pretty };

  if (args.positionals.length === 0) {
    // interactive
    stdout.write("> ");
    for await (const line of readline.createInterface({ input: stdin, output: stdout, prompt: "> " })) {
      console.log(cssify(parseClass(line, replacements), cssifyOptions));
      stdout.write("> ");
    }
    console.log();
  } else {
    const classes = new Map<string, Style>();
    await Promise.all(args.positionals.flatMap(pattern => glob.sync(pattern)).map(filename => parseFile(filename, replacements, classes)));
    const css = cssify(classes, cssifyOptions);
    if (args.values.output) {
      await fs.writeFile(args.values.output, css, "utf8");
    } else {
      console.log(css);
    }
  }
}
