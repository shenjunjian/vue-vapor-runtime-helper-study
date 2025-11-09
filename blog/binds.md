# 模板与绑定

<script setup>
import CodeRunner from './components/codeRunner.vue'
</script>
<CodeRunner />

## 模板与节点

`Vapor` 编译模板的本质就是解析模板后生成一组指令性的微代码。这些微代码大多都是浏览器原生 API 的简单包装，涉及节点的创建与修改。

### 创建节点

- `createElement` 通过`tagName`创建一个 element 元素。【未暴露】
- `createTextNode` 创建一个文字 `node` 节点。
- `createComment` 创建一个注释 `comment` 节点。【未暴露】

::: code-group

```javascript [例子]
import { createElement, createTextNode, createComment } from "vue";

const element = createElement("div");
const text = createTextNode("hello world");
const comment = createComment("comment text");

console.log({ element, text, comment });
```

```javascript [源码]
function createElement(tagName: string): HTMLElement {
  return document.createElement(tagName);
}

function createTextNode(value = ""): Text {
  return document.createTextNode(value);
}

function createComment(data: string): Comment {
  return document.createComment(data);
}
```

:::

### 模板函数创建节点

- `template` 函数是返回一个模板函数，模板函数每次执行，快速的返回一个`全新的 DOM 或文字节点`！它内部是使用`node.cloneNode(true)` 来生成一个新 Dom，它没有父节点，游离于文档之外。它的第 2 个参数为 true 时， 会指明生成的 dom 是某个窗口的根节点，具有 `$root=true` 的标记。

::: code-group

```javascript [例子]
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
```

```javascript [源码]
import { _child, createElement, createTextNode } from './node'

let t: HTMLTemplateElement

// 返回一个快速吐出一个dom的函数。
function template(html: string, root?: boolean) {
  let node: Node

  return (): Node & { $root?: true } => {
    // 1、支持文本
    if (html[0] !== '<') {
      return createTextNode(html)
    }

    // 2、使用<template>克隆全新的 DOM
    if (!node) {
      t = t || createElement('template')
      t.innerHTML = html
      node = _child(t.content)
    }
    const ret = node.cloneNode(true)

    if (root) (ret as any).$root = true
    return ret
  }
}

```

:::

### 节点的遍历与子节点

- `child` 是返回`Dom`的第 1 个`子节点Dom`。
- `nthChild` 是返回`Dom`的第 n 个`子节点Dom`。
- `next` 是返回`Dom`的下一个`兄弟Dom`。
- `txt` 是返回`DOM`中的 text 节点。
- `parentNode` 是返回`Dom`的`父级Dom`。【`vue`中未暴露】
- `querySelector` 是通过选择器查询元素。【`vue`中未暴露】

::: code-group

```javascript [例子]
import { template, child, nthChild, next, txt } from "vue";
const node = template(
  "<h1><div>第一个节点</div><div>第二个节点</div>    <div>第四个节点</div><!--注释节点--></h1>"
)();

const n1 = child(node);
const n2 = nthChild(node, 1);
const n3 = nthChild(node, 2); // 空格为 text 类型的node
const n4 = nthChild(node, 3);
const comment = next(n4);
const text = txt(n2);

console.log({ node, n1, n2, n3, n4, comment, text });
```

```javascript [源码]
function child(node: InsertionParent): Node {
  return node.firstChild!
}
function nthChild(node: InsertionParent, i: number): Node {
  return node.childNodes[i]
}
function next(node: Node): Node {
  return node.nextSibling!
}
const txt = child // vapor 编译识别到元素第一个节点为text类型时，会编译为txt 函数，意义更明确！

function parentNode(node: Node): ParentNode | null {
  return node.parentNode
}
function querySelector(selectors: string): Element | null {
  return document.querySelector(selectors)
}
```

:::

::: tip 浏览器中的 node

1、通过例子可以看到，模板中的`空格和注释`分别是`text`和`comment` 类型的节点。通过观察`vapor` 模板编译，会发现它自动移除换行和空格，生成紧凑的 dom 节点。

2、Dom 元素有两个属性访问子元素： `childNodes` 和 `children`。前者返回`node`类型，后者返回`element`,它们是有区别的！`空格和注释`不属于 `element`元素。
:::

## 绑定与修改节点

### 基础绑定

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

```javascript [例子]
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
```

```javascript [源码]
function setText(el: Text & { $txt?: string }, value: string): void {
  if (el.$txt !== value) {
    el.nodeValue = el.$txt = value;
  }
}

function setHtml(el: TargetElement, value: any): void {
  value = value == null ? "" : unsafeToTrustedHTML(value);
  if (el.$html !== value) {
    el.innerHTML = el.$html = value;
  }
}

function setClass(el: TargetElement, value: any): void {
  if (el.$root) {
    // 增量式覆盖 className, 只添加或移除框架添加过的value, 保留第3方库添加的clas
    setClassIncremental(el, value);
  } else {
    value = normalizeClass(value); // 将字符串，数组，对象形式的class值，统一为空格分隔的长字符串值

    if (value !== el.$cls) {
      // 直接覆盖 className
      el.className = el.$cls = value;
    }
  }
}

function setStyle(el: TargetElement, value: any): void {
  if (el.$root) {
    // 增量式覆盖 style
    setStyleIncremental(el, value);
  } else {
    // 将 字符串，数组，对象形式的style值，统一为对象形式的值
    const normalizedValue = normalizeStyle(value);

    patchStyle(el, el.$sty, (el.$sty = normalizedValue));
  }
}

function setAttr(el: any, key: string, value: any): void {
  // 有省略....

  if (value !== el[`$${key}`]) {
    el[`$${key}`] = value;
    if (value != null) {
      el.setAttribute(key, value);
    } else {
      el.removeAttribute(key);
    }
  }
}

function setProp(el: any, key: string, value: any): void {
  if (key in el) {
    setDOMProp(el, key, value);
  } else {
    setAttr(el, key, value);
  }
}

function setDOMProp(el: any, key: string, value: any): void {
  const prev = el[key];
  if (value === prev) return;

  let needRemove = false;
  if (value === "" || value == null) {
    const type = typeof prev;
    if (type === "boolean") {
      value = includeBooleanAttr(value);
    } else if (value == null && type === "string") {
      value = "";
      needRemove = true;
    } else if (type === "number") {
      value = 0;
      needRemove = true;
    }
  }

  el[key] = value;

  needRemove && el.removeAttribute(key);
}
```

:::

### 高级绑定

### 绑定指令
