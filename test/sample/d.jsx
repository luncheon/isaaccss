import { is } from "isaaccss";

// jsx syntax
const D = () => <div />;

export const d = show => is`${show ? "d:grid" : `d:none`}`
