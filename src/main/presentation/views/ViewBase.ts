import { BrowserWindowConstructorOptions, BrowserWindow } from "electron";
import { BehaviorSubject, ReplaySubject } from "rxjs";

import { RendererLocationProvider } from "../providers/RendererLocationProvider";
import { IMainMessageBus } from "common/messaging/IMainMessageBus";
import { MessageBus } from "common/messaging/MessageBus";

export abstract class ViewBase {
    protected window!: BrowserWindow;
    protected readonly messageBus: IMainMessageBus;
    protected readonly readyStatus: BehaviorSubject<boolean>;

    constructor() {
        this.messageBus = new MessageBus();
        this.readyStatus = new BehaviorSubject(false);
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

    protected load(name?: string) {
        this.window.loadURL(`${RendererLocationProvider.getRendererLocation()}#${name || ""}`);
        this.window.once("ready-to-show", () => this.readyStatus.next(true));
    }
}