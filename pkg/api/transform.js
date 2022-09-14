import _generate from "@babel/generator";
import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
import * as t from "@babel/types";
import { parseClass } from "./parseClass.js";
const generate = typeof _generate === "object" && typeof _generate.default === "function" ? _generate.default : _generate;
const traverse = typeof _traverse === "object" && typeof _traverse.default === "function" ? _traverse.default : _traverse;
const TAG_IMPORT_SOURCE = "isaaccss";
const TAG_IMPORT_SPECIFIER = "is";
const nthWordSequence = (chars) => (n) => {
    let s = "";
    while (n >= 0) {
        s = chars[n % chars.length] + s;
        n = Math.floor(n / chars.length) - 1;
    }
    return s;
};
const compressClassName = nthWordSequence("abcdefghijklmnopqrstuvwxyz0123456789_");
export const transform = (code, filename, options, babelParserPlugins, classes = new Map()) => {
    const compress = options?.compress ?? true;
    const compressPrefix = (typeof compress === "object" && compress?.prefix) || "#";
    const transformClassName = (className, node) => className
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
        if (parsed.unknownProperties?.length) {
            const start = node.loc?.start;
            console.warn(`isaaccss: ${filename}${start ? `:${start.line}` : ""} - Unknown property: "${parsed.unknownProperties.join('", "')}".`);
        }
        if (parsed.properties.length === 0) {
            return className;
        }
        compress && (parsed.className = compressPrefix + compressClassName(classes.size));
        classes.set(className, parsed);
        return parsed.className;
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
            if (tagBindingPath?.node.type === "ImportSpecifier" &&
                tagBindingPath.node.imported.type === "Identifier" &&
                tagBindingPath.node.imported.name === TAG_IMPORT_SPECIFIER &&
                tagBindingPath.parent.type === "ImportDeclaration" &&
                tagBindingPath.parent.source.value === TAG_IMPORT_SOURCE) {
                const quasis = path.node.quasi.quasis.map(node => {
                    const className = transformClassName(node.value.raw, node);
                    return compress && className !== node.value.raw ? t.templateElement({ raw: className }) : node;
                });
                compress && path.replaceWith(t.templateLiteral(quasis, path.node.quasi.expressions));
            }
        },
    });
    if (compress) {
        ast.program.body = ast.program.body.filter(st => st !== isaaccssImportDeclaration);
        ({ code } = generate(ast));
    }
    return { code, classes };
};
