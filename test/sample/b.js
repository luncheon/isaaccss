import { is } from "isaaccss";
import { d } from "./d";
export { d } from "./d";

const a = is`@a/:b/c:0**!?`;
export const b = is`${a}--b:2?${d}`;
