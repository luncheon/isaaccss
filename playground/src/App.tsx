import { is } from "isaaccss";
import { createMemo, createSignal } from "solid-js";
import type { JSX } from "solid-js/types/jsx";
import { cssify, defaultAliases, parseHtml } from "../../src/index.browser.js";
import sampleHtml from "./sample.html";

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
  <main class={is`d:flex flex-direction:column gap:1rem _textarea/font-family:'Source_Code_Pro',monospace _textarea/font-size:0.9375rem`}>
    <Details summary="HTML" open>
      <textarea rows="10" value={htmlContent()} onInput={e => setHtmlContent(e.currentTarget.value)} />
    </Details>

    <Details summary="Parsed Classes">
      <textarea rows="10" readonly value={classesJson()} />
    </Details>

    <Details summary="CSS">
      <textarea rows="10" readonly value={css()} />
    </Details>

    <Details summary="Pretty CSS" open>
      <textarea rows="10" readonly value={beautifiedCss()} />
    </Details>

    <Details summary="Preview" open>
      <iframe srcdoc={`<html><head><style>${css()}</style></head><body>${htmlContent()}</body></html>`}></iframe>
    </Details>
  </main>
);

const [htmlContent, setHtmlContent] = createSignal(sampleHtml);
const classes = createMemo(() => parseHtml(htmlContent(), { aliases: defaultAliases }));
const classesJson = createMemo(() => JSON.stringify([...classes().values()], undefined, 2));
const css = createMemo(() => cssify(classes().values()));
const beautifiedCss = createMemo(() => cssify(classes().values(), { pretty: true }));

export const App = () => (
  <>
    <Header />
    <Main />
  </>
);
