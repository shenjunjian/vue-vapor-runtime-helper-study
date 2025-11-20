const delegatedEvents = Object.create(null);

// 1、记录所有委托事件。第一次遇到，才绑定事件名到全局处理函数，且永不解绑。
const delegateEvents = (...names: string[]): void => {
  for (const name of names) {
    if (!delegatedEvents[name]) {
      delegatedEvents[name] = true;
      document.addEventListener(name, delegatedEventHandler);
    }
  }
};

// 2、全局处理函数
const delegatedEventHandler = (e: Event) => {
  let node = ((e.composedPath && e.composedPath()[0]) || e.target) as any;
  if (e.target !== node) {
    Object.defineProperty(e, "target", {
      configurable: true,
      value: node,
    });
  }
  Object.defineProperty(e, "currentTarget", {
    configurable: true,
    get() {
      return node || document;
    },
  });

  // while 模拟冒泡，如果当前节点有$evtXXX事件处理，则调用。
  while (node !== null) {
    const handlers = node[`$evt${e.type}`];
    if (handlers) {
      if (isArray(handlers)) {
        // 参见 3， handler可能是数组
        for (const handler of handlers) {
          if (!node.disabled) {
            handler(e);
            if (e.cancelBubble) return;
          }
        }
      } else {
        handlers(e);
        if (e.cancelBubble) return;
      }
    }
    node =
      node.host && node.host !== node && node.host instanceof Node
        ? node.host
        : node.parentNode;
  }
};

// 3、给元素同一个事件名，绑定多个事件函数。
function delegate(el: any, event: string, handler: (e: Event) => any): void {
  const key = `$evt${event}`;
  const existing = el[key];
  if (existing) {
    if (isArray(existing)) {
      existing.push(handler);
    } else {
      el[key] = [existing, handler];
    }
  } else {
    el[key] = handler;
  }
}
