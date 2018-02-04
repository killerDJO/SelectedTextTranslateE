import { BrowserWindowConstructorOptions, BrowserWindow } from "electron";
import { RendererLocationProvider } from "../RendererLocationProvider";
import { arch } from "os";

export abstract class ViewBase {
    protected window: BrowserWindow;

    constructor(options: BrowserWindowConstructorOptions, name: string) {
        options.show = false;
        this.window = new BrowserWindow(options);

        this.window.loadURL(`${RendererLocationProvider.getRendererLocation()}#${name}`);
    }

    public show(): void {
        this.window.show();
        this.window.focus();
    }

    public hide(): void {
        this.window.hide();
    }

    public sendMessage(channel: string, ...args: any[]): void {
        this.window.webContents.send(channel, args);
    }
}