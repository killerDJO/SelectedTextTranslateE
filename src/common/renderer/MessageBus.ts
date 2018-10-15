import { ipcRenderer } from "electron";
import { Channels, Messages } from "common/messaging/Messages";
import { Message } from "common/messaging/Message";
import { createMessage } from "common/messaging/create-message";

export class MessageBus {

    public observeValue<TValue, TResult = void>(name: string, callback: (value: TValue) => TResult | Promise<TResult>): Subscription {
        const subscription = new Subscription(Channels.Observe, (sender: Electron.EventEmitter, message: Message, value: TValue) => {
            if (message.name !== name) {
                return;
            }
            const result = callback(value);
            if (result instanceof Promise) {
                result.then(resultValue => ipcRenderer.send(Channels.Received, message, resultValue));
            } else {
                ipcRenderer.send(Channels.Received, message, result);
            }

        });
        subscription.subscribe();
        ipcRenderer.send(Channels.Subscribe, name);
        return subscription;
    }

    public observeConstant<TValue>(name: string): Promise<TValue> {
        return new Promise(resolve => {
            const subscription = this.observeValue<TValue>(name, value => {
                subscription.unsubscribe();
                resolve(value);
            });
        });
    }

    public sendCommand<TArgs, TResult = void>(name: string, args?: TArgs): Promise<TResult> {
        const message = createMessage(name);
        return new Promise(resolve => {

            ipcRenderer.send(Channels.Observe, message, args);

            const subscription = new Subscription(Channels.Observe, (sender: Electron.EventEmitter, receivedMessage: Message, value: TResult) => {
                if (message.name !== receivedMessage.name || message.id !== receivedMessage.id) {
                    return;
                }

                subscription.unsubscribe();
                resolve(value);
            });

            subscription.subscribe();
        });
    }

    public observeNotification<TResult = void>(name: string, callback: () => TResult | Promise<TResult>): void {
        this.observeValue<void, TResult>(name, callback);
    }
}

export class Subscription {
    constructor(
        private readonly channel: string,
        private readonly callback: Function) {
    }

    public subscribe() {
        ipcRenderer.addListener(this.channel, this.callback);
    }

    public unsubscribe() {
        ipcRenderer.removeListener(this.channel, this.callback);
    }
}