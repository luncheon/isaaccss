import { is } from "isaaccss";

// jsx syntax
const D = () => <div />;

export const d = show => is`${show ? is`d:grid` : is`d:none`}`
