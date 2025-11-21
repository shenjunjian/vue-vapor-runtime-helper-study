import { template, delegate, delegateEvents } from "vue";

const btnTemplate = template("<button></button>");
const btn1 = btnTemplate();
const btn2 = btnTemplate();

delegateEvents("click"); // 绑定全局的回调

// 单个事件绑定
btn1.$evtclick = () => console.log("单事件回调");

// 多个事件绑定
// 1、直接绑定一个数组是可行的
// dom2.$evtclick = [
//   () => console.log("多事件回调1"),
//   () => console.log("多事件回调2"),
// ];

// 2、vapor的编译系统会使用delegate 绑定多个事件
delegate(btn2, "click", () => console.log("多事件回调1"));
delegate(btn2, "click", () => console.log("多事件回调2"));

document.body.append(btn1, btn2); // 必须挂载后，才能冒泡
btn1.click();
btn2.click();

btn1.remove();
btn2.remove();
