import { createElement, createTextNode, createComment } from "vue";

const element = createElement("div");
const text = createTextNode("hello world");
const comment = createComment("comment text");

console.log({ element, text, comment });
