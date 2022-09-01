import { is } from "isaaccss";
import { render } from "solid-js/web";
import { App } from "./App.js";
import "./font.css";
import "./reset.css";

document.body.className = is`p:1rem`;

render(() => <App />, document.body);
