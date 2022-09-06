import { is } from "isaaccss";
import "./b";
export * from "./c";

export const a: string = "a";

document.body.innerHTML += `<input data-testid="a" class="${is`--a:$blue-1 c:$a bg:aliceblue @w<100px/background:hsl(0,100%,50%)* :focus/bg:#ffff00`}">`;
