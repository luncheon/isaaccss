import { parse, ParserOptions as BabelParserOptions } from "@babel/parser";
import _traverse from "@babel/traverse";
import type { StringLiteral, TemplateElement } from "@babel/types";
import { parseClass } from "./parseClass.js";
import type { ParserOptions, Style } from "./types.js";

const traverse: typeof _traverse =
  typeof _traverse === "object" && typeof (_traverse as any).default === "function" ? (_traverse as any).default : _traverse;

const TAG_IMPORT_SOURCE = "isaaccss";
const TAG_IMPORT_SPECIFIER = "is";

export const parseTaggedTemplates = (
  code: string,
  options?: ParserOptions,
  babelParserPlugins?: BabelParserOptions["plugins"],
  collectClassesTo = new Map<string, Style>(),
  collectInvalidClassesTo = new Map<string, (StringLiteral | TemplateElement)[]>()
): [Map<string, Style>, Map<string, (StringLiteral | TemplateElement)[]>] => {
  const collect = (className: string, node: StringLiteral | TemplateElement) => {
    className.split(/\s+/).forEach(className => {
      if (!className || collectClassesTo.has(className)) {
        return;
      }
      if (collectInvalidClassesTo.has(className)) {
        collectInvalidClassesTo.get(className)!.push(node);
      } else {
        const parsed = parseClass(className, options);
        parsed ? collectClassesTo.set(className, parsed) : collectInvalidClassesTo.set(className, [node]);
      }
    });
  };

  traverse(parse(code, { plugins: babelParserPlugins, errorRecovery: true }), {
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
          StringLiteral({ node }) {
            collect(node.value, node);
          },
          TemplateElement({ node }) {
            collect(node.value.raw, node);
          },
        });
      }
    },
  });

  return [collectClassesTo, collectInvalidClassesTo];
};
