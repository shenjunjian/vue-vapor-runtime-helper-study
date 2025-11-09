function createElement(tagName: string): HTMLElement {
  return document.createElement(tagName);
}

function createTextNode(value = ""): Text {
  return document.createTextNode(value);
}

function createComment(data: string): Comment {
  return document.createComment(data);
}
