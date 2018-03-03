import { BrowserWindowConstructorOptions, BrowserWindow } from "electron";
import { BehaviorSubject, ReplaySubject } from "rxjs";

import { Messages } from "common/messaging/Messages";

import { PresentationSettings } from "main/presentation/settings/PresentationSettings";
import { MessageBus } from "main/presentation/framework/MessageBus";
import { RendererLocationProvider } from "main/presentation/framework/RendererLocationProvider";

export abstract class ViewBase {
    protected readyStatus!: BehaviorSubject<boolean>;
    protected messageBus!: MessageBus;
    protected window!: BrowserWindow;

    constructor(protected readonly presentationSettings: PresentationSettings) {
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