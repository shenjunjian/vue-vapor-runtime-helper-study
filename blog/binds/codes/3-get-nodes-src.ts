function child(node: InsertionParent): Node {
  return node.firstChild!;
}
function nthChild(node: InsertionParent, i: number): Node {
  return node.childNodes[i];
}
function next(node: Node): Node {
  return node.nextSibling!;
}
const txt = child; // vapor 编译识别到元素第一个节点为text类型时，会编译为txt 函数，意义更明确！

function parentNode(node: Node): ParentNode | null {
  return node.parentNode;
}
function querySelector(selectors: string): Element | null {
  return document.querySelector(selectors);
}
