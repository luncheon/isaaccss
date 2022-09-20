import "monaco-editor/esm/vs/basic-languages/css/css.contribution.js";
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution.js";
import "monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js";
import "monaco-editor/esm/vs/editor/edcore.main.js";
import "monaco-editor/esm/vs/language/css/monaco.contribution.js";
import "monaco-editor/esm/vs/language/typescript/monaco.contribution.js";

// import * as monaco from "monaco-editor";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

import { is } from "isaaccss";
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";

self.MonacoEnvironment = { getWorkerUrl: (_, label) => (label === "css" ? "./assets/css.worker.js" : "./assets/ts.worker.js") };

{
  const ts = monaco.languages.typescript;
  ts.typescriptDefaults.setCompilerOptions({ jsx: ts.JsxEmit.Preserve, jsxFactory: "h", jsxFragmentFactory: "Fragment" });
  ts.typescriptDefaults.addExtraLib('declare module "isaaccss" { export declare const is: string["raw"] }', "isaaccss.d.ts");
}

export const Editor = (props: { class?: string; value: string; onChange: (code: string) => unknown }) => {
  let ref: HTMLDivElement;
  let instance: monaco.editor.IStandaloneCodeEditor;
  const onResize = () => instance.layout();
  onMount(() => {
    instance = monaco.editor.create(ref!, {
      fontFamily: "Source Code Pro",
      fontSize: 14,
      minimap: { enabled: false },
      model: monaco.editor.createModel(props.value, "typescript", monaco.Uri.parse("index.tsx")),
      padding: { bottom: 0 },
      renderWhitespace: "all",
      scrollBeyondLastLine: false,
    });
    instance.onDidChangeModelContent(() => props.onChange(instance.getValue()));
    createEffect(() => props.value !== instance.getValue() && instance.setValue(props.value));
    addEventListener("resize", onResize);
  });
  onCleanup(() => {
    instance.dispose();
    removeEventListener("resize", onResize);
  });
  return <div ref={ref!} class={props.class} />;
};

export const Viewer = (props: { class?: string; language: string; value: string }) => {
  const [content, setContent] = createSignal("");
  createEffect(() => monaco.editor.colorize(props.value, props.language, {}).then(setContent));
  return <div class={is`font-family:"Source_Code_Pro" font-size:14px ${props.class}`} innerHTML={content()} />;
};
