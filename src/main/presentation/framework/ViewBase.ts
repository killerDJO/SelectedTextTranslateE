import { BrowserWindow, WebPreferences } from "electron";
import { BehaviorSubject } from "rxjs";

import { MessageBus } from "presentation/infrastructure/MessageBus";
import { Messages } from "common/messaging/Messages";
import { RendererLocationProvider } from "presentation/infrastructure/RendererLocationProvider";
import { ViewNames } from "common/ViewNames";
import { ViewContext } from "./ViewContext";

export abstract class ViewBase {
    public readonly window: BrowserWindow;
    public readonly messageBus: MessageBus;
    public readonly isReadyToShow$: BehaviorSubject<boolean>;

    constructor(
        protected readonly viewName: ViewNames,
        protected readonly context: ViewContext) {

        this.window = new BrowserWindow({
            frame: false,
            backgroundColor: "#ffffff",
            focusable: true,
            thickFrame: false,
            show: false,
            webPreferences: {
                backgroundThrottling: false,
                affinity: "window"
            }
        });
        this.window.setBounds(this.getInitialBounds());

        this.isReadyToShow$ = new BehaviorSubject<boolean>(false);
        this.window.once("ready-to-show", () => this.isReadyToShow$.next(true));
        this.messageBus = new MessageBus(this.window);
        this.window.loadURL(`${RendererLocationProvider.getRendererLocation()}#${viewName}`);

        this.initializeSubscriptions();
    }

    public show(): void {
        this.isReadyToShow$.filter(isReady => isReady).subscribe(() => {
            setTimeout(() => this.window.show(), 75);
        });
    }

    public hide(): void {
        this.window.hide();
    }

    protected scale(): void {
        this.window.setBounds(this.scaleBounds(this.window.getBounds()));
        this.messageBus.sendValue(Messages.ScaleFactor, this.context.scaler.scaleFactor$.value);
    }

    protected abstract scaleBounds(bounds: Electron.Rectangle): Electron.Rectangle;

    protected abstract getInitialBounds(): Electron.Rectangle;

    private initializeSubscriptions(): void {
        this.context.scaler.scaleFactor$.subscribe(this.scale.bind(this));
        this.messageBus.registerObservable(Messages.AccentColor, this.context.accentColorProvider.accentColor$);

        this.window.on("focus", () => {
            this.context.zoomHotkeysRegistry.registerZoomHotkeys();
        });
        this.window.on("blur", () => {
            this.context.zoomHotkeysRegistry.unregisterZoomHotkeys();
        });
    }
}