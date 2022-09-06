import { is } from "isaaccss";
import { d } from "./d";
export { d } from "./d";

const div = document.body.appendChild(document.createElement("div"));
div.dataset.testid = "b";
div.className = is`bg:blue! ${d(true)}`;
