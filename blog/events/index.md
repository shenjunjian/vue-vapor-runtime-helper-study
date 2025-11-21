# 事件揭秘

<script setup>
import CodeRunner from '../components/codeRunner.vue'
</script>
<CodeRunner />

事件无疑是应用开发中的重要环节，相当于人体的神经系统，驱动着响应式数据变化。事件绑定要分为`DOM事件绑定` 和 `组件事件绑定`,需要分开叙述。

## DOM 冒泡事件绑定

在传统的 Vue3 中，每个 DOM 节点都有一个统一的事件挂载点：el.\_vei = {}， 其中键为事件名称，值为一个 invoker 函数。DOM 节点通过 addEventListener 方法将这个 invoker 函数绑定到相应的事件上。这是最原始的事件绑定方式

在 Vapor 中，对于冒泡事件做了一个大变化————事件委托，通过将事件处理委托给 `document` 监听

- `delegateEvents` 在`document`上，绑定一次`全局统一的处理函数`,每个事件仅绑定一次，大大减少页面的事件监听器数量
- `delegate` 在目标元素上，添加`$evt${eventName}` 的属性，记录当前元素需要执行`回调函数` 或者 `回调函数的数组`。

::: code-group
<<< ./codes/1-delegateEvents-demo.ts [例子]
<<< ./codes/1-delegateEvents-src.ts [源码]
:::

在 Vapor 编译时，哪些事件是冒泡事件呢？它的识别规则如下：

::: code-group

```js [compiler-vapor\src\transforms\vOn.ts]
const delegatedEvents = makeMap(
  "beforeinput,click,dblclick,contextmenu,focusin,focusout,input,keydown," +
    "keyup,mousedown,mousemove,mouseout,mouseover,mouseup,pointerdown," +
    "pointermove,pointerout,pointerover,pointerup,touchend,touchmove," +
    "touchstart"
);
// Only delegate if:
// - no dynamic event name 非动态事件名
// - no event option modifiers (passive, capture, once) 不能有某些修饰函数
// - is a delegatable event  必须是可委托的事件名
const delegate =
  arg.isStatic && !eventOptionModifiers.length && delegatedEvents(arg.content);
```

:::

## 非冒泡事件绑定

- `on` 普通事件绑定。 最原始、最直接的事件绑定，相较于传递 Vue 的 invoker 函数，它少了 try {} 捕获异常。
- `setDynamicEvents` 为元素绑定一个动态对象。 Vue 的 `v-on` 指令有个冷僻的用法，它可以绑定一个对象，其中键为事件名，值为回调函数，称之为绑定动态事件对象。

::: code-group
<<< ./codes/2-on-demo.ts [例子]
<<< ./codes/2-on-src.ts [源码]
:::
