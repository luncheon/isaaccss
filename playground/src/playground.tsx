import { createMemo, createSignal } from "solid-js";
import { JSX } from "solid-js/types/jsx";
import { render } from "solid-js/web";
import { cssify, parseHtml, presetDefault } from "../../src/index.browser.js";
import "./font.css";
import "./reset.css";
import sampleHtml from "./sample.html";

document.body.className = "p:1rem";

const Details = ({ open, summary, children }: { open?: boolean; summary: string; children: JSX.Element }) => (
  <details class="p:0.5rem box-shadow:0_0_4px_#bbb,_0_2px_8px_#bbb" open={open}>
    <summary class="cursor:pointer user-select:none f-weight:bold">{summary}</summary>
    <div class="b-w:1px b-c:#ccc">{children}</div>
  </details>
);

const [htmlContent, setHtmlContent] = createSignal(sampleHtml);
const classes = createMemo(() => parseHtml(htmlContent(), presetDefault));
const classesJson = createMemo(() => JSON.stringify(classes()));
const css = createMemo(() => cssify(classes()));
const beautifiedCss = createMemo(() => cssify(classes(), { pretty: true }));

const App = () => {
  return (
    <>
      <header class="p-b:1em f-family:logo">
        <h1>isaaccss playground</h1>
      </header>

      <main class="d:flex flex-direction:column gap:1rem _textarea/f-family:'Source_Code_Pro',monospace _textarea/f-sz:0.9375rem">
        <Details summary="HTML" open>
          <textarea rows="10" value={htmlContent()} onInput={e => setHtmlContent(e.currentTarget.value)} />
        </Details>

        <Details summary="JSON">
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
    </>
  );
};

render(() => <App />, document.body);
