# 模板与绑定

<script setup>
import CodeRunner from './components/codeRunner.vue'
</script>
<CodeRunner />

## 模板与节点

`Vapor` 编译模板的本质就是解析模板后生成一组指令性的微代码。这些微代码大多都是浏览器原生 API 的简单包装，涉及节点的创建与修改。

### 创建节点

- `createElement` 通过`tagName`创建一个 element 元素。
- `createTextNode` 创建一个文字 `node` 节点。
- `createComment` 创建一个注释 `comment` 节点。

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

### 模板函数创建节点

- `template` 函数是返回一个模板函数，模板函数每次执行，快速的返回一个`全新的 DOM 或文字节点`！它内部是使用`node.cloneNode(true)` 来生成一个新 Dom，它没有父节点，游离于文档之外。

::: code-group

```javascript [例子]
import { template } from "vue";
const staticTemplate = template("<h1><div>纯静态节点</div></h1>");
const staticDom = staticTemplate();
console.log({ staticTemplate, staticDom });

const textTemplate = template("纯文字");
const text = textTemplate();
console.log({ textTemplate, text });
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
- `setHtml` 修改 text node 的文字
- `setClass` 修改 节点的类名
- `setStyle` 修改 节点的样式
- `setAttr` 修改 节点的属性
- `setProp` 修改 节点的属性

::: code-group

```javascript [例子]

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
    // 设置 el[key]=value, 再检查value是否为： '', null, 某些特定假值。是则el.removeAttribute(key)
    setDOMProp(el, key, value);
  } else {
    setAttr(el, key, value);
  }
}

// 覆盖式设置className
function setClass(el: TargetElement, value: any): void {
  if (el.$root) {
    // 增量式覆盖 className, 只添加或移除框架添加过的value, 保留第3方库添加的clas
    setClassIncremental(el, value);
  } else {
    // 将字符串，数组，对象形式的class值，统一为空格分隔的长字符串值
    value = normalizeClass(value);

    if (value !== el.$cls) {
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
```

:::

### 高级绑定

### 绑定指令
