import { child, createElement, createTextNode } from "./node";

let t: HTMLTemplateElement;

// 返回一个快速吐出一个dom的函数。
function template(html: string, root?: boolean) {
  let node: Node;

  return (): Node & { $root?: true } => {
    // 1、支持文本
    if (html[0] !== "<") {
      return createTextNode(html);
    }

    // 2、使用<template>克隆全新的 DOM
    if (!node) {
      t = t || createElement("template");
      t.innerHTML = html;
      node = child(t.content);
    }
    const ret = node.cloneNode(true);

    if (root) (ret as any).$root = true;
    return ret;
  };
}
