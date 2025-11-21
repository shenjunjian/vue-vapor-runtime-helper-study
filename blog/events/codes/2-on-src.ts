function addEventListener(el: Element, event: string, handler, options) {
  el.addEventListener(event, handler, options);
  return (): void => el.removeEventListener(event, handler, options); // 返回解绑函数
}

export function on(
  el: Element,
  event: string,
  handler: (e: Event) => any,
  options: AddEventListenerOptions & { effect?: boolean } = {}
): void {
  addEventListener(el, event, handler, options);
  if (options.effect) {
    onEffectCleanup(() => {
      el.removeEventListener(event, handler, options);
    });
  }
}

export function setDynamicEvents(
  el: HTMLElement,
  events: Record<string, (...args: any[]) => any>
): void {
  for (const name in events) {
    on(el, name, events[name], { effect: true });
  }
}
