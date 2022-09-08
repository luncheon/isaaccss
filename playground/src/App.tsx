import { is } from "isaaccss";
import { createMemo, createSignal } from "solid-js";
import type { JSX } from "solid-js/types/jsx";
import sampleTsx from "./sample.txt";
import { transform } from "./transform";

const [sourceCode, setSourceCode] = createSignal(sampleTsx);
const transformed = createMemo(() => transform(sourceCode()));

const previewHtmlContent = (js: string, css: string) => `<html>
  <head>
    <link rel="stylesheet" href="https://unpkg.com/open-props/open-props.min.css">
    <style>${css}</style>
    <script type="module">${js}</script>
  </head>
  <body></body>
</html>`;

const Header = () => (
  <header class={is`p-b:1em font-family:logo d:inline-flex flex-direction:column align-items:center`}>
    <h1 class={is`font-size:2.5rem font-style:oblique`}>isaaccss</h1>
    <h2 class={is`font-size:1rem c:gray letter-spacing:0.375em`}>playground</h2>
  </header>
);

const Details = ({ open, summary, children }: { open?: boolean; summary: string; children: JSX.Element }) => (
  <details class={is`p:0.5rem box-shadow:0_0_4px_#bbb,_0_2px_8px_#bbb`} open={open}>
    <summary class={is`cursor:pointer user-select:none font-weight:bold`}>{summary}</summary>
    <div class={is`b-w:1px b-c:#ccc`}>{children}</div>
  </details>
);

const Main = () => (
  <main class={is`d:flex flex-direction:column gap:1rem _textarea/font-family:'Source_Code_Pro',monospace _textarea/font-size:0.875rem`}>
    <Details summary="index.tsx" open>
      <textarea rows="30" value={sourceCode()} onChange={e => setSourceCode(e.currentTarget.value)} />
    </Details>

    <Details summary="index.js">
      <textarea rows="10" readonly value={transformed().error ?? transformed().code} />
    </Details>

    <Details summary="index.css">
      <textarea rows="10" readonly value={transformed().css ?? ""} />
    </Details>

    <Details summary="Preview" open>
      <iframe srcdoc={previewHtmlContent(transformed().code ?? "", transformed().css ?? "")}></iframe>
    </Details>
  </main>
);

export const App = () => (
  <>
    <Header />
    <Main />
  </>
);
