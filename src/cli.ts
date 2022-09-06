#!/usr/bin/env node
import glob from "glob";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { parseArgs } from "node:util";
import { AcceptedPlugin } from "postcss";
import { applyPostcss } from "./applyPostcss.js";
import {
  cssify,
  CssOptions,
  defaultReplacements,
  mergeReplacements,
  parseClass,
  parseHtml,
  ParserOptions,
  Style,
  transformTaggedTemplates,
} from "./index.node.js";

const defaultConfigFilename = ["isaaccss.config.mjs", "isaaccss.config.js"];

interface ResolvedConfig {
  readonly parser: ParserOptions;
  readonly cssify: CssOptions;
  readonly postcss?: { readonly plugins?: AcceptedPlugin[] };
}

const resolveConfig = async (args: { config?: string; pretty?: boolean }): Promise<ResolvedConfig> => {
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
      replacements: importedConfig?.replacements ? mergeReplacements(importedConfig.replacements) : defaultReplacements,
    },
    cssify: {
      pretty: importedConfig?.pretty || args.pretty,
    },
    postcss: importedConfig?.postcss,
  };
};

const parseFile = async (filename: string, config?: ParserOptions, classes = new Map<string, Style>()) => {
  if (/\.html?/.test(filename)) {
    return parseHtml(await fs.promises.readFile(filename, "utf8"), config, classes);
  }
  const match = filename.match(/\.[cm]?([jt])s(x?)/);
  if (match) {
    const babelParserPlugins = [...(match[2] ? ["jsx" as const] : []), ...(match[1] === "t" ? ["typescript" as const] : [])];
    const code = await fs.promises.readFile(filename, "utf8");
    transformTaggedTemplates(code, filename, config, babelParserPlugins, classes);
  } else {
    console.warn(`ignore file: ${filename}`);
  }
  return classes;
};

const interact = async (config: ResolvedConfig) => {
  process.stdout.write("> ");
  for await (const line of readline.createInterface({ input: process.stdin, output: process.stdout })) {
    const parsed = parseClass(line, config.parser);
    parsed && console.log(applyPostcss(cssify([parsed], config.cssify), config.postcss));
    process.stdout.write("> ");
  }
  console.log();
};

let args;
try {
  args = parseArgs({
    strict: true,
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

  -c, --config      Configuration script filename.
                    If unspecified, ${defaultConfigFilename.map(f => `"${f}"`).join(" or ")} of the current directory is used.
  -o, --output      Output css filename. Console if unspecified.
  --pretty          Pretty print.
  target            Glob pattern with /\\.html/ or /\\.[cm]?[jt]sx?/ extension.
                    Interactive mode if unspecified.
`);
}

if (args) {
  const config = await resolveConfig(args.values);
  if (args.positionals.length === 0) {
    interact(config);
  } else {
    const classes = new Map<string, Style>();
    await Promise.all(args.positionals.flatMap(pattern => glob.sync(pattern)).map(filename => parseFile(filename, config.parser, classes)));
    const css = await applyPostcss(cssify(classes.values(), config.cssify), config.postcss);
    if (args.values.output) {
      await fs.promises.writeFile(args.values.output, css, "utf8");
    } else {
      console.log(css);
    }
  }
}
