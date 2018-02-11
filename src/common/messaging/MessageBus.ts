import { ipcRenderer } from "electron"
import { IMainMessageBus } from "./IMainMessageBus";
import { IRendererMessageBus } from "./IRendererMessageBus";

export class MessageBus implements IMainMessageBus, IRendererMessageBus {

    public sendTranslateResult(window: Electron.BrowserWindow, translateResult: string): void {
        window.webContents.send("translate-result", translateResult);
    }

    public receiveTranslateResult(callback: (translateResult: string) => void): void {
        ipcRenderer.on("translate-result", (sender: Electron.EventEmitter, translateResult: string) => {
            callback(translateResult);
        });
    }
}