import {
  createTextNode,
  template,
  setText,
  setHtml,
  setClass,
  setStyle,
  setAttr,
  setProp,
  setDOMProp,
  simpleSetCurrentInstance,
} from "vue";
simpleSetCurrentInstance({}); // 模拟代码运行在组件内，否则setAttr, setProp会报异常

const textNode = createTextNode("hello world");
setText(textNode, "why not create a new world?");

const divElement = template("<div></div>", false)();
divElement.className = ["echart-container"]; // 该类名会丢失
divElement.style.position = "relative"; // 根据实测结果，style永远是 patch模式更新，所以该值可以保留

setHtml(divElement, "<b>bold text</b>");
setClass(divElement, ["red", { blue: true }]);
setStyle(divElement, { background: "red" });
setAttr(divElement, "title", "new world");
setProp(divElement, "contenteditable", true);

const rootElement = template("<div></div>", true)();
rootElement.className = ["echart-container"];
rootElement.style.position = "relative";

setHtml(rootElement, "<b>bold text</b>");
setClass(rootElement, ["red", { blue: true }]);
setStyle(rootElement, { background: "red" });
setAttr(rootElement, "title", "new world");
setProp(rootElement, "contenteditable", true);

console.log({ textNode, divElement, rootElement });
console.log("观察发现： divElement不能保留住 class, 而 rootElement 是可以");
