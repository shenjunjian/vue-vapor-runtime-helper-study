import {
  ref,
  createFor,
  template,
  txt,
  simpleSetCurrentInstance,
  setText,
  renderEffect,
} from "vue";

simpleSetCurrentInstance({
  appContext: { config: { performance: false } },
  type: {},
}); // 模拟代码运行在组件内，否则会报异常

const liTemplate = template("<li> </li>");

const list = ref([
  { id: 1, name: "张三" },
  { id: 2, name: "李四" },
]);

const forFrag = createFor(
  () => list.value, // source
  (item, key, idx) => {
    const liEl = liTemplate();
    const liText = txt(liEl);

    renderEffect(() => {
      setText(liText, `#${key}:  ${item.name}-${key}`);
    });
  },
  (item) => item.id, // key
  1
);

console.log(forFrag);
