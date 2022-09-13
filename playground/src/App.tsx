import { is } from "isaaccss";
import { createMemo, type JSX } from "solid-js";
import { Editor, sourceCode, Viewer } from "./Editor";
import { transform } from "./transform";

const transformed = createMemo(() => transform(sourceCode()));

const previewHtmlContent = (js: string, css: string) => `<html>
  <head>
    <style>${css}</style>
    <script type="module">${js}</script>
  </head>
  <body></body>
</html>`;

const Header = () => (
  <header
    class={is`p:1rem_1rem_0_1rem align-self:start font-family:logo d:inline-flex flex-direction:column align-items:center line-height:1`}
  >
    <h1 class={is`font-size:2.5rem font-style:oblique`}>isaaccss</h1>
    <h2 class={is`font-size:1rem c:gray letter-spacing:0.375em`}>playground</h2>
  </header>
);

const Section = (props: { class?: string; caption: string; children: JSX.Element }) => (
  <section class={is`d:flex flex-direction:column overflow:hidden box-shadow:0_0_4px_#bbb,_0_2px_8px_#bbb ${props.class}`}>
    <h4 class={is`p:.25rem_.5rem box-shadow:0_1px_3px_#ccc m-b:3px`}>{props.caption}</h4>
    {props.children}
  </section>
);

const Main = () => (
  <main
    class={is`
        p:1rem flex:1 overflow:hidden
        d:grid grid-template:"tsx_js"_1fr_"tsx_css"_1fr_"tsx_preview"_1fr_/_1fr_1fr gap:1rem
        _textarea/font-family:'Source_Code_Pro',monospace _textarea/font-size:0.875rem
      `}
  >
    <Section caption="index.tsx" class={is`grid-area:tsx`}>
      <Editor class={is`flex:1 overflow:hidden`} />
    </Section>
    <Section caption="index.js" class={is`grid-area:js`}>
      <Viewer class={is`flex:1 overflow:auto p:0_.5rem`} language="javascript" value={transformed().error ?? transformed().code ?? ""} />
    </Section>
    <Section caption="index.css" class={is`grid-area:css`}>
      <Viewer class={is`flex:1 overflow:auto p:0_.5rem`} language="css" value={transformed().css ?? ""} />
    </Section>
    <Section caption="preview" class={is`grid-area:preview`}>
      <iframe class={is`flex:1 overflow:auto`} srcdoc={previewHtmlContent(transformed().code ?? "", transformed().css ?? "")}></iframe>
    </Section>
  </main>
);

document.body.className = is`d:flex flex-direction:column`;

export const App = () => (
  <>
    <Header />
    <Main />
  </>
);
