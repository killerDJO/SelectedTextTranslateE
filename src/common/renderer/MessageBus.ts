import { ipcRenderer } from "electron";
import { Channels, Messages } from "common/messaging/Messages";
import { Message } from "common/messaging/Message";
import { createMessage } from "common/messaging/create-message";

export class MessageBus {

    public observeValue<TValue>(name: string, callback: (value: TValue) => void): void {
        ipcRenderer.on(Channels.Observe, (sender: Electron.EventEmitter, message: Message, value: TValue) => {
            if (message.name !== name) {
                return;
            }
            callback(value);
            ipcRenderer.send(Channels.Received, message);
        });
        ipcRenderer.send(Channels.Subscribe, name);
    }

    public sendCommand<TValue>(name: string, value?: TValue): void {
        ipcRenderer.send(Channels.Observe, name, value);
    }

    public getValue<TValue, TArgs>(name: string, args?: TArgs): Promise<TValue> {
        const message = createMessage(name);
        return new Promise(resolve => {

            ipcRenderer.send(Channels.Observe, message, args);

            const callback = (sender: Electron.EventEmitter, receivedMessage: Message, value: TValue) => {
                if (message.name !== receivedMessage.name || message.id !== receivedMessage.id) {
                    return;
                }

                ipcRenderer.removeListener(Channels.Observe, callback);
                resolve(value);
            };

            ipcRenderer.on(Channels.Observe, callback);
        });
    }

    public observeNotification(name: string, callback: () => void): void {
        this.observeValue<void>(name, callback);
    }
}