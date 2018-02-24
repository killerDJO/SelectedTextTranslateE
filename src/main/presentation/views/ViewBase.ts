import { BrowserWindowConstructorOptions, BrowserWindow } from "electron";
import { BehaviorSubject, ReplaySubject } from "rxjs";

import { RendererLocationProvider } from "../framework/RendererLocationProvider";
import { ScaleProvider } from "../framework/ScaleProvider";
import { MessageBus } from "../framework/MessageBus";
import { Messages } from "common/messaging/Messages";

export abstract class ViewBase {
    protected readyStatus!: BehaviorSubject<boolean>;
    protected messageBus!: MessageBus;
    protected window!: BrowserWindow;

    constructor(protected readonly scaleProvider: ScaleProvider) {
    }

    public show(): void {
        this.readyStatus.first(isReady => isReady).subscribe(() => {
            this.window.show();
            this.window.focus();
        });
    }

    public hide(): void {
        this.window.hide();
    }

    protected initialize(window: Electron.BrowserWindow, name?: string) {
        this.window = window;
        this.messageBus = new MessageBus(window);
        this.readyStatus = new BehaviorSubject(false);

        this.window.loadURL(`${RendererLocationProvider.getRendererLocation()}#${name || ""}`);
        this.window.once("ready-to-show", () => this.readyStatus.next(true));
    }
}