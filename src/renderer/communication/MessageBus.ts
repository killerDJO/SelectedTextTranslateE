import { ipcRenderer } from "electron";
import { Channels, Messages } from "common/messaging/Messages";

export class MessageBus {

    public getValue<TValue>(name: Messages, callback: (value: TValue) => void): void {
        ipcRenderer.on(Channels.Observe, (sender: Electron.EventEmitter, receivedName: string, value: TValue) => {
            if (receivedName !== name) {
                return;
            }
            callback(value);
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