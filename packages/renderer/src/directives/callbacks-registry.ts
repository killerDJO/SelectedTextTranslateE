interface Callback {
  readonly event: string;
  listener(event: Event): void;
  capture: boolean;
}

export class CallbacksRegistry {
  private readonly callbacksMap: Map<HTMLElement, Callback[]> = new Map();

  public unregisterAllCallbacks(element: HTMLElement): void {
    const callbacks = this.callbacksMap.get(element) || [];
    callbacks.forEach(callback =>
      element.removeEventListener(callback.event, callback.listener, { capture: callback.capture })
    );
  }

  public registerCallback(
    element: HTMLElement,
    event: string,
    callback: (event: Event) => void,
    capture = false
  ): void {
    const callbacks: Callback[] = this.callbacksMap.get(element) || [];
    callbacks.push({ event, listener: callback, capture });
    element.addEventListener(event, callback, { capture: capture });
    this.callbacksMap.set(element, callbacks);
  }
}
