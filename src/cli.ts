import glob from "glob";
import fs from "node:fs/promises";
import { stdin, stdout } from "node:process";
import readline from "node:readline/promises";
import { parseArgs } from "node:util";
import { cssify, IsaacClass, parseClass, parseFile, presetDefault } from "./index.node.js";

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
  const config = presetDefault;
  const cssifyOptions = { pretty: args.values.pretty };

  if (args.positionals.length === 0) {
    // interactive
    stdout.write("> ");
    for await (const line of readline.createInterface({ input: stdin, output: stdout, prompt: "> " })) {
      console.log(cssify(parseClass(line, config), cssifyOptions));
      stdout.write("> ");
    }
    console.log();
  } else {
    const classes = new Map<string, IsaacClass>();
    await Promise.all(
      args.positionals
        .flatMap(pattern => glob.sync(pattern))
        .map(filename => parseFile(filename, config, classes).catch(() => console.warn(`ignore file: ${filename}`)))
    );
    const css = cssify(classes, cssifyOptions);
    if (args.values.output) {
      await fs.writeFile(args.values.output, css, "utf8");
    } else {
      console.log(css);
    }
  }
}
