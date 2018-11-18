interface Callback {
    readonly event: string;
    listener(event: Event): void;
}

export abstract class DirectivesBase {
    private readonly callbacksMap: Map<HTMLElement, Callback[]> = new Map();

    protected unbind(element: HTMLElement): void {
        const callbacks = this.callbacksMap.get(element) || [];
        callbacks.forEach(callback => element.removeEventListener(callback.event, callback.listener));
    }

    protected registerCallback(element: HTMLElement, event: string, callback: (event: Event) => void): void {
        const callbacks: Callback[] = this.callbacksMap.get(element) || [];
        callbacks.push({ event, listener: callback });
        element.addEventListener(event, callback);
        this.callbacksMap.set(element, callbacks);
    }
}