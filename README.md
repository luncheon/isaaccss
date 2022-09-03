# isaaccss: Inline-Style-as-a-Class CSS utility

A CSS class DSL like inline styles.

<!-- prettier-ignore -->
```jsx
import { is } from "isaaccss";

const Button = () => (
  <button class={is`--H:210 --S:100% --L:50% padding:4px_8px @width>=768px/padding:8px_16px border-radius:8px color:white border:3px_solid_hsl(var(--H),var(--S),80%) background:hsl(var(--H),var(--S),var(--L)) :hover/--L:60% :active/--L:40%* @hover:hover/:hover/scale:1.1`}>
    Submit
  </button>
);
```

Or using some replacements:

<!-- prettier-ignore -->
```jsx
import { is } from "isaaccss";

const Button = () => (
  <button class={is`--H:210 --S:100% --L:50% p:4px_8px @w>=768px/p:8px_16px b-radius:8px c:white b:3px_solid_hsl($H,$S,80%) bg:hsl($H,$S,$L) :hover/--L:60% :active/--L:40%* @hover:hover/:hover/scale:1.1`}>
    Submit
  </button>
)
```

- Unlike inline styles:
  - Media queries and selectors (combinators, pseudo-class, pseudo-elements) can be described
  - Specificity can be adjusted
  - Short aliases can be used
  - [`Content-Security-Policy`](https://developer.mozilla.org/docs/Web/HTTP/Headers/Content-Security-Policy): no need `'unsafe-inline'` or `'nonce-a682b15c'` for [`style-src`](https://developer.mozilla.org/docs/Web/HTTP/Headers/Content-Security-Policy/style-src)
- Unlike [Tailwind CSS](https://tailwindcss.com/) and [Windi CSS](https://windicss.org/):
  - This is a class name description rule, not a predefined property set, therefore:
    - Less to remember
    - Simple and flexible: any media, any selector, any property and any value can be described as is
  - High specificity (ID-specificity = 1) by default to override styles from other CSS libraries
  - Specificity can be adjusted
  - Invalid class names can be detected
- Unlike [Linaria](https://linaria.dev/):
  - Short aliases can be used

## Class Format

```
[@media/][selectors/]property:value[*][!][?]
```

- Optional `@media/` indicates [media queries](https://developer.mozilla.org/docs/Web/CSS/Media_Queries/Using_media_queries)
  - `@foo/...` generates `@media foo {...}`
  - Tokens are parenthesized where necessary
- Optional `selectors/` indicates additional selectors
  - [Pseudo-classes](https://developer.mozilla.org/docs/Web/CSS/Pseudo-classes)  
    e.g. `:hover/`, `:has(>:checked)/`
  - [Pseudo-elements](https://developer.mozilla.org/docs/Web/CSS/Pseudo-elements)  
    e.g. `::before/`, `::part(foo)/`
  - [Child combinator](https://developer.mozilla.org/docs/Web/CSS/Child_combinator)  
    e.g. `>div/`
  - [Adjacent sibling combinator](https://developer.mozilla.org/docs/Web/CSS/Adjacent_sibling_combinator)  
    e.g. `+div/`
  - [General sibling combinator](https://developer.mozilla.org/docs/Web/CSS/General_sibling_combinator)  
    e.g. `~div/`
  - Combination of the above  
    e.g. `:hover>input+label::before/`
- Required `property` indicates the property name
  - Must be one of the [known properties](https://github.com/known-css/known-css-properties/blob/master/data/all.json) or a [custom property](https://developer.mozilla.org/docs/Web/CSS/--*)
- Required `value` indicates the property value
  - `$bar` will be replaced with `var(--bar)`
    - Custom property set libraries, such as [Open Props](https://open-props.style/), can help with design themes
- Optional trailing `*` increases ID-[specificity](https://developer.mozilla.org/docs/Web/CSS/Specificity), more than one can be specified
  - For example, add `*` to the preferred style between `:hover` and `:active`
- Optional trailing `!` indicates [`!important`](https://developer.mozilla.org/en-US/docs/Web/CSS/important)
  - For example, add `?` to the components in a component library, so that applications using it can override the properties
- Optional trailing `?` generates unnamed [`@layer{}`](https://developer.mozilla.org/docs/Web/CSS/@layer)
- An underscore `_` will be replaced with a whitespace ` ` and can be escaped with a backslash (`\_` will be replaced with `_`)

## Installation

```
npm i -D isaaccss
```

## Usage

### CLI

```
isaaccss [-c config.js] [-o output.css] [--pretty] [target...]

  -c, --config      Configuration script filename.
                    If unspecified, "isaaccss.config.mjs" or "isaaccss.config.js" of the current directory is used.
  -o, --output      Output css filename. Console if unspecified.
  --pretty          Pretty print.
  target            Glob pattern with /\\.html?$/ or /\\.[cm]?[jt]sx?$/ extension.
                    Interactive mode if unspecified.
```

Example configuration script:

```js
import { defaultReplacements } from "isaaccss";
import OpenProps from "open-props";
import postcssJitProps from "postcss-jit-props";

export default {
  // Whether to pretty-print. Default is `false`.
  pretty: true,

  // Replacements. Default is `defaultReplacements`.
  // But if specified, it will be overwritten.
  replacements: [
    // If you want to extend the default, pass `defaultReplacements`.
    defaultReplacements,

    // Custom replacements. For example:
    {
      media: {
        dark: "prefers-color-scheme:dark",
        light: "prefers-color-scheme:light",
        sm: "640px", // use breakpoints like `@w<sm/d:none`
        md: "768px",
      },
      selector: {
        "::a": "::after",
        "::b": "::before",
        ":f": ":focus",
        ":h": ":hover",
      },
      property: {
        items: "align-items",
        justify: "justify-content",
      },
      value: {
        abs: "absolute",
        rel: "relative",
      },
    },
  ],

  // Optional PostCSS config. The only field is `plugins`.
  // For example, to use Open Props such as `color:$blue-1`:
  postcss: {
    plugins: [postcssJitProps(OpenProps)],
  },
};
```

See [src/replacements/default.ts](https://github.com/luncheon/isaaccss/blob/main/src/replacements/default.ts) for `defaultReplacements`.

### [esbuild](https://esbuild.github.io/)

```js
import esbuild from "esbuild";
import isaaccss from "isaaccss/esbuild";

esbuild.build({
  entryPoints: ["src/index.ts"],
  outdir: "dist",
  bundle: true,
  // Inject `isaaccss.inject`.
  inject: [isaaccss.inject],
  plugins: [
    isaaccss.plugin({
      // Optional filename filter. Default is following.
      filter: /\.[cm][jt]x?$/,

      // Optional isaaccss config.
      // See example configuration scripts in the CLI section above.
      pretty: true,
      replacements: [],
      postcss: { plugins: [] },
    }),
  ],
});
```

### [Rollup](https://rollupjs.org/)

```js
// rollup.config.js
import isaaccss from "isaaccss/rollup";

/** @type {import("rollup").RollupOptions} */
export default {
  input: "src/index.js",
  output: { file: "dist/index.js" },
  plugins: [
    isaaccss({
      // Optional include filter. By default, all bundled scripts are included.
      include: ["**/*.js"],

      // Optional exclude filter. By default, `**/node_modules/**` are excluded.
      exclude: ["**/node_modules/**"],

      // Optional output filename.
      // Default is the output script filename with extension ".css".
      output: "dist/index.css",

      // Optional isaaccss config.
      // See example configuration scripts in the CLI section above.
      pretty: true,
      replacements: [],
      postcss: { plugins: [] },
    }),
  ],
};
```

When you want to merge other CSS files with isaaccss CSS, use [`rollup-plugin-import-css`](https://github.com/jleeson/rollup-plugin-import-css) instead of [`rollup-plugin-css-only`](https://github.com/thgh/rollup-plugin-css-only).

```js
// rollup.config.js
import css from "rollup-plugin-import-css";
import isaaccss from "isaaccss/rollup";

/** @type {import("rollup").RollupOptions} */
export default {
  input: "src/index.js",
  output: { file: "dist/index.js" },
  plugins: [css(), isaaccss()],
};
```

### [Vite](https://vitejs.dev/)

```js
// vite.config.js
import isaaccssPlugin from "isaaccss/vite";

/** @type {import("vite").UserConfig} */
export default {
  plugins: [
    isaaccssPlugin({
      // Options are same as for Rollup isaaccss plugin above.
    }),
  ],
};
```

## License

[WTFPL](http://www.wtfpl.net/)
