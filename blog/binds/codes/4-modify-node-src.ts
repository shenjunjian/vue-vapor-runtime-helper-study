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
