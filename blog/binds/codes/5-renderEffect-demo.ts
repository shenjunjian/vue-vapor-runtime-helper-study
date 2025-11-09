import {
  renderEffect,
  ref,
  template,
  txt,
  setText,
  setClass,
  nextTick,
} from "vue";

const divElement = template("<div> </div>")();
const txtNode = txt(divElement);

const text = ref("hello world");
const isBlue = ref(false);

// 创建副作用区域
renderEffect(() => {
  setText(txtNode, text.value);
  setClass(divElement, ["red", { blue: isBlue.value }]);
});

// 1秒后修改响应数据
setTimeout(() => {
  text.value = "new world";
  isBlue.value = true;
  nextTick(() => {
    console.log({ divElement, html: divElement.outerHTML });
  });
}, 1000);
