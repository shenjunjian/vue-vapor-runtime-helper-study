import { template, on, setDynamicEvents } from "vue";

const btnTemplate = template("<button></button>");
const btn1 = btnTemplate();
const btn2 = btnTemplate();

// 普通事件
on(btn1, "focus", () => console.log("按钮1激活事件回调"));

// 动态事件
setDynamicEvents(btn2, {
  click: () => console.log("点击事件回调"),
  focus: () => console.log("激活事件回调"),
});

document.body.append(btn1, btn2); // 必须挂载后，才能冒泡

btn1.focus();

btn2.focus();
btn2.click();

btn1.remove();
btn2.remove();
