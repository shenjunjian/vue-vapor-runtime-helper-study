# 模板与绑定

<script setup>
import CodeRunner from '../components/codeRunner.vue'
</script>
<CodeRunner />

`Vapor` 编译模板的本质就是解析模板后生成一组指令性的微代码。这些微代码大多都是浏览器原生 API 的简单包装，涉及节点的创建与修改。

在阅读源码时，我注意到以下问题：

1. 在`runtime-vapor`包中， 有许多函数导出并使用，但并未在`vue`中进行导出，官方应该是只导出了 vapor 的编译产物中使用到的函数。
2. 许多函数看似很纯粹，但实际运行时会访问到`instance、vapor runtime `中的一些变量或闭包变量, 从而不那么纯粹, 比如 `setAttr` 、`renderEffect`等等。这会造成：不能脱离框架而自由的使用这些函数。
3. 基本所有的函数，都需要有处理`正常浏览器内的逻辑` 和处理 `hydrate SSG 水合的逻辑` 两种任务。有的是写成 2 个函数，有的是在同一个函数内走不同的代码分支。

## 创建节点

- `createElement` 通过`tagName`创建一个 element 元素。【未暴露】
- `createTextNode` 创建一个文字 `node` 节点。
- `createComment` 创建一个注释 `comment` 节点。【未暴露】

::: code-group
<<< ./codes/1-create-node-demo.ts [例子]
<<< ./codes/1-create-node-src.ts [源码]
:::

## 模板函数创建节点

- `template` 函数是返回一个模板函数，模板函数每次执行，快速的返回一个`全新的 DOM 或文字节点`。它内部是使用`node.cloneNode(true)` 来生成一个没有父节点，游离于文档之外的新 DOM。它的第 2 个参数为 true 时， 会指明生成的 dom 是某个窗口的根节点，具有 `$root=true` 的标记。

::: code-group
<<< ./codes/2-template-demo.ts [例子]
<<< ./codes/2-template-src.ts [源码]
:::

## 节点的遍历与子节点

- `child` 是返回`Dom`的第 1 个`子节点Dom`。
- `nthChild` 是返回`Dom`的第 n 个`子节点Dom`。
- `next` 是返回`Dom`的下一个`兄弟Dom`。
- `txt` 是返回`DOM`中的 text 节点。
- `parentNode` 是返回`Dom`的`父级Dom`。【`vue`中未暴露】
- `querySelector` 是通过选择器查询元素。【`vue`中未暴露】

::: code-group
<<< ./codes/3-get-nodes-demo.ts [例子]
<<< ./codes/3-get-nodes-src.ts [源码]
::: tip 浏览器中的 node

1、通过例子可以看到，模板中的`空格和注释`分别是`text`和`comment` 类型的节点。通过观察`vapor` 模板编译，会发现它自动移除换行和空格，生成紧凑的 dom 节点。

2、Dom 元素有两个属性访问子元素： `childNodes` 和 `children`。前者返回`node`类型，后者返回`element`,它们是有区别的！`空格和注释`不属于 `element`元素。
:::

## 修改节点

- `setText` 修改 text node 的文字
- `setHtml` 设置元素的 el.innerHtml
- `setClass` 根据元素的旧值和传入的新值，进行 patch 式更新 el.className
- `setStyle` 根据元素的旧值和传入的新值，进行 patch 式更新 el.style
- `setAttr` 直接设置元素的 attr
- `setProp` 设置元素的 prop 或 设置 attr
- `setDOMProp` 设置元素的 prop, 清除时，同步 removeAttribute

::: tip 增量更新 class/style

当 vapor 与 其它第 3 方库配合使用时，第 3 方库可能会操作元素的 class/style， 如果直接覆盖元素的值，那么会破坏掉第 3 方库的功能。所以 setClass 与 setStyle 在修改元素值的时候，会判断`el.$root` 是否为真，就执行`增量更新策略`，就是通过 vapor 添加的样式和属性，它才执行添加或移除的操作，而其它方式引入的 class/style，是不会主动修改。

通过 `template(html, root)` 方法，创建的元素具有`$root`属性。在什么时候， vapor 编译模板会将节点编译为 `root 节点`呢？ 目前仅观察到：组件具有唯一根节点时，根节点才具有`$root`属性。
:::

::: code-group
<<< ./codes/4-modify-node-demo.ts [例子]
<<< ./codes/4-modify-node-src.ts [源码]
:::

## 响应更新节点

- `renderEffect` 创建一个渲染副作用区域，底层依赖于 `@vue/reactivity` 包中的 `ReactiveEffect` 类。

::: code-group
<<< ./codes/5-renderEffect-demo.ts [例子]
<<< ./codes/5-renderEffect-src.ts [源码]
:::

延伸阅读： v-model

## v-if 的实现

- `createIf` : 创建一个 if 逻辑块, 它内部是使用委托给 `DynamicFragment` 类来实现响应。在 vapor 中，为了管理一种逻辑块(Block)，它使用 `VaporFragment` 抽象类来对应一个 `Block`, 通过源码` class DynamicFragment extends VaporFragment`可以看出， `DynamicFragment` 类就是一种动态块 (Block), 与 v-if 类似还有 v-for 和 slot, 都分别对应于某种 `VaporFragment`。

::: code-group
<<< ./codes/6-createIf-demo.ts [例子]
<<< ./codes/6-createIf-src.ts [源码]
:::

## v-for

- `createFor` : 创建一组 for 逻辑块。

::: code-group
<<< ./codes/7-createFor-demo.ts [例子]
<<< ./codes/7-createFor-src.ts [源码]
:::
