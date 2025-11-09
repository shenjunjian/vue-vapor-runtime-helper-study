import {
  ref,
  createIf,
  template,
  simpleSetCurrentInstance,
  nextTick,
} from "vue";

simpleSetCurrentInstance({
  appContext: { config: { performance: false } },
  type: {},
}); // 模拟代码运行在组件内，否则会报异常

const show = ref(false);
const showTemplate = template("<div> i am show </div>");
const hideTemplate = template("<div> i am hide </div>");

const ifFrag = createIf(
  () => show,
  () => showTemplate(),
  () => hideTemplate()
);

console.log("show=false 时的 if块", ifFrag);

setTimeout(() => {
  show.value = true;
  nextTick(() => {
    console.log("show=true 时的 if块", ifFrag);
  });
}, 1000);
