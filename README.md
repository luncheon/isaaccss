# isaaccss: Inline Style as a Class CSS utility

A CSS class DSL like inline styles.

<!-- prettier-ignore -->
```html
<button class="--hue:210 padding:4px_8px @width>=768px/padding:8px_16px border-radius:8px color:white border:3px_solid_hsl(var(--hue),100%,80%) background:hsl(var(--hue),100%,50%) :hover/background:hsl(var(--hue),100%,60%) :active/background:hsl(var(--hue),100%,40%)* @hover:hover/:hover/scale:1.1">
  Submit
</button>
```

Or using some replacements:

<!-- prettier-ignore -->
```html
<button class="--hue:210 p:4px_8px @w>=768px/p:8px_16px b-radius:8px c:white b:3px_solid_hsl($hue,100%,80%) bg:hsl($hue,100%,50%) :hover/bg:hsl($hue,100%,60%) :active/bg:hsl($hue,100%,40%)* @hover:hover/:hover/scale:1.1">
  Submit
</button>
```

- Unlike inline styles:
  - Media queries and selectors (combinators, pseudo-class, pseudo-elements) can be described
  - Specificity can be adjusted
  - Short aliases can be used
  - [`Content-Security-Policy`](https://developer.mozilla.org/docs/Web/HTTP/Headers/Content-Security-Policy): no need `style-src 'unsafe-inline'` or `style-src 'nonce-a682b15c'`
- Unlike [Tailwind CSS](https://tailwindcss.com/) and [Windi CSS](https://windicss.org/):
  - This is a class name description rule, not a predefined property set, therefore:
    - Less to remember
    - Simple and flexible: any media, any selector, any property and any value can be described as is
  - High specificity (ID-specificity = 1) by default to override styles from other CSS libraries
  - Specificity can be adjusted
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

## Usage

### CLI

```
isaaccss [-c config.js] [-o output.css] [--pretty] [target...]

  --config, -c      Configuration script filename.
                    If unspecified, "isaaccss.config.js" of the current directory is used.
  --output, -o      Output css filename. Console if unspecified.
  --pretty          Pretty print.
  target            Glob pattern with /\\.html/ or /\\.[cm]?[jt]sx?/ extension.
                    Interactive mode if unspecified.
```

Example configuration script:

```js
import { defaultReplacements, mergeReplacements } from "isaaccss";

export default {
  // Whether to pretty-print. Default is `false`.
  pretty: true,

  // Replacements. Default is `defaultReplacements`. But if specified, it will be overwritten.
  // If you want to extend the default, use `mergeReplacements()`.
  replacements: mergeReplacements(defaultReplacements, {
    // Custom replacements
    media: [
      [/\bdark\b/g, "prefers-color-scheme:dark"],
      [/\blight\b/g, "prefers-color-scheme:light"],
    ],
    selector: [
      [/(^|\b)::a\b/g, "::after"],
      [/(^|\b)::b\b/g, "::before"],
      [/(^|\b):h\b/g, ":hover"],
      [/(^|\b):f\b/g, ":focus"],
    ],
    property: [
      [/^ff$/, "font-family"],
      [/^fw$/, "font-weight"],
    ],
    value: [
      [/^abs$/, "absolute"],
      [/^rel$/, "relative"],
    ],
  }),
};
```

See [src/replacements/default.ts](src/replacements/default.ts) for `defaultReplacements`.

### [esbuild](https://esbuild.github.io/)

```js
import esbuild from "esbuild";
import isaaccss from "isaaccss/lib/esbuild";
import { defaultReplacements, mergeReplacements } from "isaaccss";

esbuild.build({
  entryPoints: ["src/index.ts"],
  outdir: "dist",
  bundle: true,
  minify: true,
  plugins: [
    isaaccss({
      // Required output method. Can be a function that takes CSS string.
      output: { filename: "dist/index.css", append: true },

      // Optional filename filter. Default is following.
      filter: /\.[cm][jt]x?$/,

      // Optional isaaccss config.
      // See example configuration scripts in the CLI section above.
      config: {
        pretty: true,
        replacements: mergeReplacements(defaultReplacements, {}),
      },
    }),
  ],
});
```

## License

[WTFPL](http://www.wtfpl.net/)
