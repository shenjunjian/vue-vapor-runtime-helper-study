import { template } from "vue";
const staticTemplate = template("<h1><div>纯静态节点</div></h1>");
const staticDom = staticTemplate();
console.log({ staticTemplate, staticDom });

const textTemplate = template("纯文字");
const textDom = textTemplate();
console.log({ textTemplate, textDom });

const rootTemplate = template("<div></div>", true);
const rootDom = rootTemplate();
console.log("观察 rootDom.$root", { rootDom });
