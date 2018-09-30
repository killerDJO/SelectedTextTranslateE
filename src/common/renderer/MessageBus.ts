import { ipcRenderer } from "electron";
import { Channels, Messages } from "common/messaging/Messages";
import { Message } from "common/messaging/Message";
import { createMessage } from "common/messaging/create-message";

export class MessageBus {

    public observeValue<TValue>(name: string, callback: (value: TValue) => void): Subscription {
        const subscription = new Subscription(Channels.Observe, (sender: Electron.EventEmitter, message: Message, value: TValue) => {
            if (message.name !== name) {
                return;
            }
            callback(value);
            ipcRenderer.send(Channels.Received, message);
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

    public observeNotification(name: string, callback: () => void): void {
        this.observeValue<void>(name, callback);
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