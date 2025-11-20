# 事件揭秘

<script setup>
import CodeRunner from '../components/codeRunner.vue'
</script>
<CodeRunner />

事件无疑是应用开发中的重要环节，相当于人体的神经系统，驱动着响应式数据变化。事件绑定要分为`DOM事件绑定` 和 `组件事件绑定`,需要分开叙述。

## DOM 冒泡事件绑定

在传统的 Vue3 中，每个 DOM 节点都有一个统一的事件挂载点：el.\_vei = {}， 其中键为事件名称，值为一个 invoker 函数。DOM 节点通过 addEventListener 方法将这个 invoker 函数绑定到相应的事件上。这是最原始的事件绑定方式

但是在 vapor 中，对于冒泡事件做了一个大变化————事件委托。 在 React 中，早就引入了“合成事件”的概念，通过将事件处理委托给 document 或挂载的#app，并同时解决不同浏览器之间事件对象的差异问题。可见 Vapor 也是认可这个做法的

- `delegateEvents` 在`document`上，绑定一次`全局统一的处理函数`,每个事件仅绑定一次，大大减少页面的事件监听器数量

::: code-group
<<< ./codes/1-delegateEvents-demo.ts [例子]
<<< ./codes/1-delegateEvents-src.ts [源码]
:::
