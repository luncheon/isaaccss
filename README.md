# isaaccss: Inline Style as a Class CSS Framework

A CSS class DSL like inline styles.

<!-- prettier-ignore -->
```html
<button class="--hue:210 padding:4px_8px @width>=768px/padding:8px_16px border-radius:8px color:white border:3px_solid_hsl(var(--hue),100%,80%) background:hsl(var(--hue),100%,50%) :hover/background:hsl(var(--hue),100%,60%) :active/background:hsl(var(--hue),100%,40%)* @hover:hover/:hover/scale:1.1">
  Submit
</button>
```

or using some replacements:

<!-- prettier-ignore -->
```html
<button class="--hue:210 p:4px_8px @w>=768px/p:8px_16px b-radius:8px c:white b:3px_solid_hsl($hue,100%,80%) bg:hsl($hue,100%,50%) :hover/bg:hsl($hue,100%,60%) :active/bg:hsl($hue,100%,40%)* @hover:hover/:hover/scale:1.1">
  Submit
</button>
```

- unlike inline style:
  - media queries and selectors (combinators, pseudo-class, pseudo-elements, etc.) can be described
  - specificity can be adjusted
  - aliases (replacements) can be used
  - [`Content-Security-Policy`](https://developer.mozilla.org/docs/Web/HTTP/Headers/Content-Security-Policy): no need `style-src 'unsafe-inline'` or `style-src 'nonce-a682b15c'`
- unlike [Tailwind CSS](https://tailwindcss.com/) and [Windi CSS](https://windicss.org/):
  - a class name description rule, not a predefined property set, therefore:
    - less to remember
    - simple and flexible: any media, any selector, any property and any value can be described as is
  - high specificity by default
  - specificity can be adjusted

## Class Format

```
[@media/][selectors/]property:value[*][!][?]
```

- optional `@media/` indicates [media queries](https://developer.mozilla.org/docs/Web/CSS/Media_Queries/Using_media_queries)
  - `@foo/...` generates `@media foo { ... }`
  - tokens are parenthesized where necessary
- optional `selectors/` indicates additional selectors
  - [pseudo-classes](https://developer.mozilla.org/docs/Web/CSS/Pseudo-classes)  
    e.g. `:hover/`, `:has(>:checked)/`
  - [pseudo-elements](https://developer.mozilla.org/docs/Web/CSS/Pseudo-elements)  
    e.g. `::before/`, `::part(foo)/`
  - [child combinator](https://developer.mozilla.org/docs/Web/CSS/Child_combinator)  
    e.g. `>div/`
  - [adjacent sibling combinator](https://developer.mozilla.org/docs/Web/CSS/Adjacent_sibling_combinator)  
    e.g. `+div/`
  - [general sibling combinator](https://developer.mozilla.org/docs/Web/CSS/General_sibling_combinator)  
    e.g. `~div/`
  - combination of the above  
    e.g. `:hover>input+label::before/`
- required `property` indicates the property name
  - [known properties](https://github.com/known-css/known-css-properties/blob/master/data/all.json) or [custom properties](https://developer.mozilla.org/docs/Web/CSS/--*)
- required `value` indicates the property value
  - `$bar` will be replaced with `var(--bar)`
- optional trailing `*` increases ID-[specificity](https://developer.mozilla.org/docs/Web/CSS/Specificity), more than one can be specified
  - for example, add `*` to the preferred style between `:hover` and `:active`
- optional trailing `!` indicates [`!important`](https://developer.mozilla.org/en-US/docs/Web/CSS/important)
  - for example, add `?` to the components in a component library, so that applications using it can override the properties
- optional trailing `?` generates unnamed [`@layer{}`](https://developer.mozilla.org/docs/Web/CSS/@layer)
- an underscore `_` will be replaced with a whitespace ` ` and can be escaped with a backslash (`\_` will be replaced with `_`)

## Usage

### CLI

```
isaaccss [--pretty] [-o output.css] [target...]
```

- `--pretty`: pretty print
- `--output`, `-o`: output css filename
- `target`: glob pattern with `/\.html/` or `/\.[cm]?[jt]sx?/` extension

### [esbuild](https://esbuild.github.io/)

```js
import esbuild from "esbuild";
import isaaccss from "isaaccss/lib/esbuild";

esbuild.build({
  entryPoints: ["src/index.ts"],
  outdir: "dist",
  bundle: true,
  minify: true,
  plugins: [
    isaaccss({
      // optional filename filter. default is following.
      filter: /\.[cm][jt]x?$/,

      // required output method. can be a function that takes CSS string.
      output: { filename: "dist/index.css", append: true },
    }),
  ],
});
```

## License

[WTFPL](http://www.wtfpl.net/)
