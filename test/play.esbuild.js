import { expect, test } from "@playwright/test";
import esbuild from "esbuild";
import isaaccss from "isaaccss/esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenProps from "open-props";
import postcssJitProps from "postcss-jit-props";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolve = (...segments) => path.resolve(__dirname, ...segments);

const build = options =>
  esbuild.build({
    entryPoints: [resolve("sample/index.js")],
    outdir: resolve("dist"),
    bundle: true,
    minify: true,
    inject: [isaaccss.inject],
    plugins: [isaaccss.plugin(options)],
    write: false,
  });

const html = (js, css) => `
<html>
  <head><style>${css}</style></head>
  <body><script>${js}</script></body>
</html>
`;

test.describe("esbuild", () => {
  test("default", async ({ page }) => {
    const result = await build();
    await page.setViewportSize({ width: 100, height: 100 });
    await page.setContent(html(result.outputFiles[0].text, result.outputFiles[1].text));
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

  test("Open Props", async ({ page }) => {
    const result = await build({ postcss: { plugins: [postcssJitProps(OpenProps)] } });
    await page.setContent(html(result.outputFiles[0].text, result.outputFiles[1].text));
    await expect(page.locator("data-testid=a")).toHaveCSS("color", "rgb(208, 235, 255)");
  });

  test("filter", async ({ page }) => {
    const result = await build({ filter: /\.(js|tsx?)$/ });
    await page.setContent(html(result.outputFiles[0].text, result.outputFiles[1].text));
    await expect(page.locator("data-testid=a")).toHaveCSS("background-color", "rgb(240, 248, 255)");
    await expect(page.locator("data-testid=b")).toHaveCSS("background-color", "rgb(0, 0, 255)");
    await expect(page.locator("data-testid=b")).toHaveCSS("display", "block");
    await expect(page.locator("data-testid=c")).toHaveCSS("color", "rgb(0, 255, 255)");
    await expect(page.locator("data-testid=c")).toHaveCSS("display", "block");
  });

  test("uncompressed", async ({ page }) => {
    const compressed = await build();
    const uncompressed = await build({ compress: false });
    expect(compressed.outputFiles[0].text.length).toBeLessThan(uncompressed.outputFiles[0].text.length);
    expect(compressed.outputFiles[1].text.length).toBeLessThan(uncompressed.outputFiles[1].text.length);
    await page.setContent(html(uncompressed.outputFiles[0].text, uncompressed.outputFiles[1].text));
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
});
