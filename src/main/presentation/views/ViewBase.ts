import { BrowserWindowConstructorOptions, BrowserWindow } from "electron";
import { RendererLocationProvider } from "../RendererLocationProvider";
import { IMainMessageBus } from "common/messaging/IMainMessageBus";
import { MessageBus } from "common/messaging/MessageBus";

export abstract class ViewBase {
    protected readonly Window: BrowserWindow;
    protected readonly MessageBus: IMainMessageBus;

    constructor(options: BrowserWindowConstructorOptions, name: string) {
        options.show = false;
        this.Window = new BrowserWindow(options);
        this.MessageBus = new MessageBus();

        this.Window.loadURL(`${RendererLocationProvider.getRendererLocation()}#${name}`);
    }

    public show(): void {
        this.Window.show();
        this.Window.focus();
    }

    public hide(): void {
        this.Window.hide();
    }
}