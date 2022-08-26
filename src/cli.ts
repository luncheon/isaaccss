#!/usr/bin/env node
import glob from "glob";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { parseArgs } from "node:util";
import {
  cssify,
  CssOptions,
  defaultReplacements,
  mergeReplacements,
  parseClass,
  parseHtml,
  ParserOptions,
  parseScript,
  Style,
} from "./index.node.js";

const defaultConfigFilename = ["isaaccss.config.mjs", "isaaccss.config.js"];

const resolveConfig = async (args: { config?: string; pretty?: boolean }): Promise<{ parser: ParserOptions; cssify: CssOptions }> => {
  const dirname = process.cwd();
  let importedConfig;
  if (args.config) {
    importedConfig = await import(path.resolve(dirname, args.config));
  } else {
    const defaultConfigPath = defaultConfigFilename.map(filename => path.join(dirname, filename)).find(filepath => fs.existsSync(filepath));
    if (defaultConfigPath) {
      importedConfig = await import(defaultConfigPath);
    }
  }
  importedConfig = importedConfig?.default ?? importedConfig;
  return {
    parser: {
      replacements: importedConfig?.replacements ? mergeReplacements(importedConfig?.replacements) : defaultReplacements,
    },
    cssify: {
      pretty: importedConfig?.pretty || args.pretty,
    },
  };
};

const parseFile = async (filename: string, config?: ParserOptions, collectTo = new Map<string, Style>()) => {
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

const interact = async (parserOptions: ParserOptions, cssOptions: CssOptions) => {
  process.stdout.write("> ");
  for await (const line of readline.createInterface({ input: process.stdin, output: process.stdout })) {
    console.log(cssify(parseClass(line, parserOptions), cssOptions));
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
} catch {
  console.log(`
isaaccss [-c config.js] [-o output.css] [--pretty] [target...]

  --config, -c      Configuration script filename.
                    If unspecified, ${defaultConfigFilename.map(f => `"${f}"`).join(" or ")} of the current directory is used.
  --output, -o      Output css filename. Console if unspecified.
  --pretty          Pretty print.
  target            Glob pattern with /\\.html/ or /\\.[cm]?[jt]sx?/ extension.
                    Interactive mode if unspecified.
`);
}

if (args) {
  const config = await resolveConfig(args.values);
  if (args.positionals.length === 0) {
    interact(config.parser, config.cssify);
  } else {
    const classes = new Map<string, Style>();
    await Promise.all(args.positionals.flatMap(pattern => glob.sync(pattern)).map(filename => parseFile(filename, config.parser, classes)));
    const css = cssify(classes, config.cssify);
    if (args.values.output) {
      await fs.promises.writeFile(args.values.output, css, "utf8");
    } else {
      console.log(css);
    }
  }
}
