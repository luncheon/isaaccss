import { is } from "isaaccss";
import { d } from "./d";
export { d } from "./d";

// tsx syntax
// @ts-ignore
export const C = ({ children }: { children: any }) => <div>{children}</div>;

document.body.innerHTML += `<div data-testid="c" class="${is`color:#0ff?`} ${d(false)}"></div>`;
