import { expect, test } from "@playwright/test";
import isaaccssPlugin from "isaaccss/vite";
import OpenProps from "open-props";
import postcssJitProps from "postcss-jit-props";
import { build } from "vite";
import viteConfig from "../vite.config.js";

const html = (js, css) => `
<html>
  <head><style>:where(*){box-sizing:content-box}${css}</style></head>
  <body><script type="module">${js}</script></body>
</html>
`;

test.describe("vite", () => {
  test("default", async ({ page }) => {
    const { output } = await build({ ...viteConfig, plugins: [isaaccssPlugin()] });
    expect(output.length).toBe(3);
    expect(output[0].fileName).toBe("index.js");
    expect(output[1].fileName).toBe("index.css");
    expect(output[2].fileName).toBe("index.html");
    await page.setContent(html(output[0].code, output[1].source));
    await expect(page.locator("data-testid=a")).toHaveCSS("box-sizing", "border-box");
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

  test("output filename can be specified", async ({ page }) => {
    const { output } = await build({ ...viteConfig, plugins: [isaaccssPlugin({ output: "c.css" })] });
    expect(output.length).toBe(4);
    expect(output[0].fileName).toBe("index.js");
    expect(output[1].fileName).toBe("index.css");
    expect(output[2].fileName).toBe("c.css");
    expect(output[3].fileName).toBe("index.html");
    await page.setContent(html(output[0].code, output[2].source));
    await expect(page.locator("data-testid=a")).toHaveCSS("box-sizing", "content-box");
    await expect(page.locator("data-testid=a")).toHaveCSS("background-color", "rgb(240, 248, 255)");
  });

  test("open props", async ({ page }) => {
    const { output } = await build({ ...viteConfig, plugins: [isaaccssPlugin({ postcss: { plugins: [postcssJitProps(OpenProps)] } })] });
    await page.setContent(html(output[0].code, output[1].source));
    await expect(page.locator("data-testid=a")).toHaveCSS("background-color", "rgb(240, 248, 255)");
    await expect(page.locator("data-testid=a")).toHaveCSS("color", "rgb(208, 235, 255)");
  });

  test("include: a,b,c", async ({ page }) => {
    const { output } = await build({ ...viteConfig, plugins: [isaaccssPlugin({ include: ["**/*.{js,ts,tsx}"] })] });
    await page.setContent(html(output[0].code, output[1].source));
    await expect(page.locator("data-testid=a")).toHaveCSS("background-color", "rgb(240, 248, 255)");
    await expect(page.locator("data-testid=b")).toHaveCSS("background-color", "rgb(0, 0, 255)");
    await expect(page.locator("data-testid=b")).toHaveCSS("display", "block");
    await expect(page.locator("data-testid=c")).toHaveCSS("color", "rgb(0, 255, 255)");
    await expect(page.locator("data-testid=c")).toHaveCSS("display", "block");
  });

  test("exclude: d", async ({ page }) => {
    const { output } = await build({ ...viteConfig, plugins: [isaaccssPlugin({ exclude: ["**/*.jsx"] })] });
    await page.setContent(html(output[0].code, output[1].source));
    await expect(page.locator("data-testid=a")).toHaveCSS("background-color", "rgb(240, 248, 255)");
    await expect(page.locator("data-testid=b")).toHaveCSS("background-color", "rgb(0, 0, 255)");
    await expect(page.locator("data-testid=b")).toHaveCSS("display", "block");
    await expect(page.locator("data-testid=c")).toHaveCSS("color", "rgb(0, 255, 255)");
    await expect(page.locator("data-testid=c")).toHaveCSS("display", "block");
  });
});
