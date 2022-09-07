import postcss, { CssSyntaxError } from "postcss";
// see PostCSS Runner Guidelines
// https://github.com/postcss/postcss/blob/main/docs/guidelines/runner.md
export const postcssify = async (css, options) => {
    if (!options?.plugins?.length) {
        return css;
    }
    try {
        const processed = await postcss(options.plugins).process(css, { from: undefined });
        processed.warnings().forEach(warn => console.warn(warn.toString()));
        return processed.css;
    }
    catch (error) {
        if (error instanceof CssSyntaxError) {
            console.warn(error.message + error.showSourceCode());
            return css;
        }
        else {
            throw error;
        }
    }
};
