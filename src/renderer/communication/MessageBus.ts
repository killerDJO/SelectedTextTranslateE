import { ipcRenderer } from "electron";
import { Channels, Messages } from "common/messaging/Messages";
import { Message } from "common/messaging/Message";

export class MessageBus {

    public getValue<TValue>(name: Messages, callback: (value: TValue) => void): void {
        ipcRenderer.on(Channels.Observe, (sender: Electron.EventEmitter, message: Message, value: TValue) => {
            if (message.name !== name) {
                return;
            }
            callback(value);
            ipcRenderer.send(Channels.Received, message);
        });
        ipcRenderer.send(Channels.Subscribe, name);
    }

    public sendCommand<TValue>(name: Messages, value?: TValue): void {
        ipcRenderer.send(Channels.Observe, name, value);
    }

    public getNotification(name: Messages, callback: () => void): void {
        this.getValue<void>(name, callback);
    }
}