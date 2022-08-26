import { render } from "solid-js/web";
import { App } from "./App.js";
import "./font.css";
import "./reset.css";

document.body.className = "p:1rem";

render(() => <App />, document.body);
