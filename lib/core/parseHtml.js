import { Parser } from "htmlparser2";
import { parseClass } from "./parseClass.js";
export const parseHtml = (content, options, collectTo = new Map()) => {
    new Parser({
        onattribute(name, value) {
            if (name === "class") {
                value.split(" ").forEach(className => {
                    const parsed = !collectTo.has(className) && parseClass(className, options);
                    parsed && collectTo.set(className, parsed);
                });
            }
        },
    }).end(content);
    return collectTo;
};
