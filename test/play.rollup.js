import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "@playwright/test";
import resolve from "@rollup/plugin-node-resolve";
import sucrase from "@rollup/plugin-sucrase";
import isaaccssPlugin from "isaaccss/rollup";
import OpenProps from "open-props";
import postcssJitProps from "postcss-jit-props";
import { rollup } from "rollup";
import css from "rollup-plugin-import-css";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolvePath = (...segments) => path.resolve(__dirname, ...segments);

const input = resolvePath("sample/a.ts");
const plugins = [resolve({ extensions: [".js", ".jsx", ".ts", ".tsx"] }), sucrase({ production: true, transforms: ["jsx", "typescript"] })];

const html = (js, css) => `
<html>
  <head><style>:where(*){box-sizing:content-box}${css}</style></head>
  <body><script type="module">${js}</script></body>
</html>
`;

test.describe("rollup", () => {
  test("default", async ({ page }) => {
    const build = await rollup({ input, plugins: [isaaccssPlugin(), ...plugins] });
    const { output } = await build.generate({ file: "a.js" });
    expect(output.length).toBe(2);
    expect(output[0].fileName).toBe("a.js");
    expect(output[1].fileName).toBe("a.css");
    await page.setContent(html(output[0].code, output[1].source));
    await expect(page.locator("data-testid=a")).toHaveCSS("box-sizing", "content-box");
    await expect(page.locator("data-testid=a")).toHaveCSS("color", "rgb(0, 0, 0)");
    await expect(page.locator("data-testid=a")).toHaveCSS("background-color", "rgb(240, 248, 255)");
    await expect(page.locator("data-testid=b")).toHaveCSS("background-color", "rgb(0, 0, 255)");
    await expect(page.locator("data-testid=b")).toHaveCSS("display", "grid");
    await expect(page.locator("data-testid=c")).toHaveCSS("color", "rgb(0, 255, 255)");
    await expect(page.locator("data-testid=c")).toHaveCSS("display", "none");
    await page.locator("data-testid=a").focus();
    await expect(page.locator("data-testid=a")).toHaveCSS("background-color", "rgb(255, 255, 0)");
    await page.setViewportSize({ width: 99, height: 100 });
    await expect(page.locator("data-testid=a")).toHaveCSS("background-color", "rgb(255, 0, 0)");
  });

  test("default output filename is based on bundle filename", async ({ page }) => {
    const build = await rollup({ input, plugins: [isaaccssPlugin(), ...plugins] });
    const { output } = await build.generate({ file: "b.js" });
    expect(output.length).toBe(2);
    expect(output[0].fileName).toBe("b.js");
    expect(output[1].fileName).toBe("b.css");
    await page.setContent(html(output[0].code, output[1].source));
    await expect(page.locator("data-testid=a")).toHaveCSS("background-color", "rgb(240, 248, 255)");
  });

  test("output filename can be specified", async ({ page }) => {
    const build = await rollup({ input, plugins: [isaaccssPlugin({ output: "c.css" }), ...plugins] });
    const { output } = await build.generate({ file: "a.js" });
    expect(output.length).toBe(2);
    expect(output[0].fileName).toBe("a.js");
    expect(output[1].fileName).toBe("c.css");
    await page.setContent(html(output[0].code, output[1].source));
    await expect(page.locator("data-testid=a")).toHaveCSS("background-color", "rgb(240, 248, 255)");
  });

  test("bundle with other css", async ({ page }) => {
    const build = await rollup({ input: resolvePath("sample/index.js"), plugins: [css(), isaaccssPlugin(), ...plugins] });
    const { output } = await build.generate({ file: "a.js" });
    expect(output.length).toBe(2);
    expect(output[0].fileName).toBe("a.js");
    expect(output[1].fileName).toBe("a.css");
    await page.setContent(html(output[0].code, output[1].source));
    await expect(page.locator("data-testid=a")).toHaveCSS("box-sizing", "border-box");
    await expect(page.locator("data-testid=a")).toHaveCSS("background-color", "rgb(240, 248, 255)");
  });

  test("bundle with other css, another output filename", async ({ page }) => {
    const build = await rollup({ input: resolvePath("sample/index.js"), plugins: [css(), isaaccssPlugin({ output: "b.css" }), ...plugins] });
    const { output } = await build.generate({ file: "a.js" });
    expect(output.length).toBe(3);
    expect(output[0].fileName).toBe("a.js");
    expect(output[1].fileName).toBe("a.css");
    expect(output[2].fileName).toBe("b.css");
    await page.setContent(html(output[0].code, output[2].source));
    await expect(page.locator("data-testid=a")).toHaveCSS("box-sizing", "content-box");
    await expect(page.locator("data-testid=a")).toHaveCSS("background-color", "rgb(240, 248, 255)");
  });

  test("open props", async ({ page }) => {
    const build = await rollup({ input, plugins: [isaaccssPlugin({ postcss: { plugins: [postcssJitProps(OpenProps)] } }), ...plugins] });
    const { output } = await build.generate({ file: "a.js" });
    expect(output.length).toBe(2);
    expect(output[0].fileName).toBe("a.js");
    expect(output[1].fileName).toBe("a.css");
    await page.setContent(html(output[0].code, output[1].source));
    await expect(page.locator("data-testid=a")).toHaveCSS("background-color", "rgb(240, 248, 255)");
    await expect(page.locator("data-testid=a")).toHaveCSS("color", "rgb(208, 235, 255)");
  });

  test("include: a,b,c", async ({ page }) => {
    const build = await rollup({ input, plugins: [isaaccssPlugin({ include: ["**/*.{js,ts,tsx}"] }), ...plugins] });
    const { output } = await build.generate({ file: "a.js" });
    expect(output.length).toBe(2);
    expect(output[0].fileName).toBe("a.js");
    expect(output[1].fileName).toBe("a.css");
    await page.setContent(html(output[0].code, output[1].source));
    await expect(page.locator("data-testid=a")).toHaveCSS("background-color", "rgb(240, 248, 255)");
    await expect(page.locator("data-testid=b")).toHaveCSS("background-color", "rgb(0, 0, 255)");
    await expect(page.locator("data-testid=b")).toHaveCSS("display", "block");
    await expect(page.locator("data-testid=c")).toHaveCSS("color", "rgb(0, 255, 255)");
    await expect(page.locator("data-testid=c")).toHaveCSS("display", "block");
  });

  test("exclude: d", async ({ page }) => {
    const build = await rollup({ input, plugins: [isaaccssPlugin({ exclude: ["**/*.jsx"] }), ...plugins] });
    const { output } = await build.generate({ file: "a.js" });
    expect(output.length).toBe(2);
    expect(output[0].fileName).toBe("a.js");
    expect(output[1].fileName).toBe("a.css");
    await page.setContent(html(output[0].code, output[1].source));
    await expect(page.locator("data-testid=a")).toHaveCSS("background-color", "rgb(240, 248, 255)");
    await expect(page.locator("data-testid=b")).toHaveCSS("background-color", "rgb(0, 0, 255)");
    await expect(page.locator("data-testid=b")).toHaveCSS("display", "block");
    await expect(page.locator("data-testid=c")).toHaveCSS("color", "rgb(0, 255, 255)");
    await expect(page.locator("data-testid=c")).toHaveCSS("display", "block");
  });
});
