# ISaaC: Inline Style as a Class

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
    - simple and powerful
    - any [known property](https://github.com/known-css/known-css-properties/blob/master/data/all.json) and any value can be described
  - high specificity by default
  - specificity can be adjusted

## Class Format

```
[@media/][selectors/]property:value[*][!][?]
```

- optional `@media/` indicates [media queries](https://developer.mozilla.org/docs/Web/CSS/Media_Queries/Using_media_queries):
  - `@foo/...` generates CSS `@media foo { ... }`
  - tokens are parenthesized where necessary
- optional `selectors/` indicates additional selectors:
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
  - any [known properties](https://github.com/known-css/known-css-properties/blob/master/data/all.json) and [custom properties](https://developer.mozilla.org/docs/Web/CSS/--*) (e.g. `--foo`)
- required `value` indicates the property value
- optional trailing `*` increases ID-[specificity](https://developer.mozilla.org/docs/Web/CSS/Specificity), more than one can be specified
  - for example, add `*` to the preferred style between `:hover` and `:active`
- optional trailing `!` indicates [`!important`](https://developer.mozilla.org/en-US/docs/Web/CSS/important)
  - for example, add `?` to the components in a component library, so that applications using it can override the properties
- optional trailing `?` generates unnamed [`@layer{}`](https://developer.mozilla.org/docs/Web/CSS/@layer)
- an underscore `_` becomes a whitespace ` ` and can be escaped with a backslash (`\_` becomes `_`)

## Configuration

T.B.D.

## API

T.B.D.

## License

[WTFPL](http://www.wtfpl.net/)
