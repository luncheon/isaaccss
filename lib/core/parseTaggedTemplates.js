import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
import { parseClass } from "./parseClass.js";
const traverse = typeof _traverse === "object" && typeof _traverse.default === "function" ? _traverse.default : _traverse;
const TAG_IMPORT_SOURCE = "isaaccss";
const TAG_IMPORT_SPECIFIER = "is";
export const parseTaggedTemplates = (code, options, babelParserPlugins, collectClassesTo = new Map(), collectInvalidClassesTo = new Map()) => {
    const collect = (className, node) => {
        className.split(/\s+/).forEach(className => {
            if (!className || collectClassesTo.has(className)) {
                return;
            }
            if (collectInvalidClassesTo.has(className)) {
                collectInvalidClassesTo.get(className).push(node);
            }
            else {
                const parsed = parseClass(className, options);
                parsed ? collectClassesTo.set(className, parsed) : collectInvalidClassesTo.set(className, [node]);
            }
        });
    };
    traverse(parse(code, { plugins: babelParserPlugins, errorRecovery: true }), {
        TaggedTemplateExpression(path) {
            const tagBindingPath = path.node.tag.type === "Identifier" ? path.scope.getBinding(path.node.tag.name)?.path : undefined;
            if (tagBindingPath?.node.type === "ImportSpecifier" &&
                tagBindingPath.node.imported.type === "Identifier" &&
                tagBindingPath.node.imported.name === TAG_IMPORT_SPECIFIER &&
                tagBindingPath.parent.type === "ImportDeclaration" &&
                tagBindingPath.parent.source.value === TAG_IMPORT_SOURCE) {
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
