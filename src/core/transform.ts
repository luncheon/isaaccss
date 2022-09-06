import _generate from "@babel/generator";
import { parse, ParserOptions as BabelParserOptions } from "@babel/parser";
import _traverse from "@babel/traverse";
import * as t from "@babel/types";
import { parseClass } from "./parseClass.js";
import type { Style, TransformOptions } from "./types.js";

const generate: typeof _generate =
  typeof _generate === "object" && typeof (_generate as any).default === "function" ? (_generate as any).default : _generate;
const traverse: typeof _traverse =
  typeof _traverse === "object" && typeof (_traverse as any).default === "function" ? (_traverse as any).default : _traverse;

const TAG_IMPORT_SOURCE = "isaaccss";
const TAG_IMPORT_SPECIFIER = "is";

const nthWordSequence = (chars: string) => (n: number) => {
  let s = "";
  while (n >= 0) {
    s = chars[n % chars.length] + s;
    n = Math.floor(n / chars.length) - 1;
  }
  return s;
};

const compressClassName = nthWordSequence("abcdefghijklmnopqrstuvwxyz0123456789_");

export const transform = (
  code: string,
  filename: string,
  options?: TransformOptions,
  babelParserPlugins?: BabelParserOptions["plugins"],
  classes = new Map<string, Style>(),
): { code: string; classes: Map<string, Style> } => {
  const compress = options?.compress ?? true;
  const compressPrefix = (typeof compress === "object" && compress?.prefix) || "#";

  const transformClassName = (className: string, node: t.StringLiteral | t.TemplateElement) =>
    className
      .split(/\s+/)
      .map(className => {
        if (!className) {
          return className;
        }
        const existing = classes.get(className);
        if (existing) {
          return existing.className;
        }
        const parsed = parseClass(className, options);
        if (parsed) {
          compress && (parsed.className = compressPrefix + compressClassName(classes.size));
          classes.set(className, parsed);
          return parsed.className;
        } else {
          const start = node.loc?.start;
          console.warn(`isaaccss: ${filename}${start ? `:${start.line}` : ""} - Couldn't parse class "${className}".`);
          return className;
        }
      })
      .join(" ");

  const ast = parse(code, { plugins: babelParserPlugins, errorRecovery: true });
  const isaaccssImportDeclaration = ast.program.body.find(st => st.type === "ImportDeclaration" && st.source.value === TAG_IMPORT_SOURCE);
  if (!isaaccssImportDeclaration) {
    return { code, classes };
  }

  traverse(ast, {
    TaggedTemplateExpression(path) {
      const tagBindingPath = path.node.tag.type === "Identifier" ? path.scope.getBinding(path.node.tag.name)?.path : undefined;
      if (
        tagBindingPath?.node.type === "ImportSpecifier" &&
        tagBindingPath.node.imported.type === "Identifier" &&
        tagBindingPath.node.imported.name === TAG_IMPORT_SPECIFIER &&
        tagBindingPath.parent.type === "ImportDeclaration" &&
        tagBindingPath.parent.source.value === TAG_IMPORT_SOURCE
      ) {
        path.traverse({
          StringLiteral(path) {
            const className = transformClassName(path.node.value, path.node);
            compress && className !== path.node.value && path.replaceWith(t.stringLiteral(className))[0].skip();
          },
          TemplateElement(path) {
            const className = transformClassName(path.node.value.raw, path.node);
            compress && className !== path.node.value.raw && path.replaceWith(t.templateElement({ raw: className }))[0].skip();
          },
        });
        compress && path.replaceWith(t.templateLiteral(path.node.quasi.quasis, path.node.quasi.expressions));
      }
    },
  });

  if (compress) {
    ast.program.body = ast.program.body.filter(st => st !== isaaccssImportDeclaration);
    ({ code } = generate(ast));
  }
  return { code, classes };
};
