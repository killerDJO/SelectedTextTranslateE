import { BrowserWindow } from "electron";
import { BehaviorSubject } from "rxjs";

import { PresentationSettings } from "presentation/settings/PresentationSettings";
import { Scaler } from "presentation/infrastructure/Scaler";
import { HotkeysRegistry } from "presentation/hotkeys/HotkeysRegistry";
import { MessageBus } from "presentation/infrastructure/MessageBus";
import { Messages } from "common/messaging/Messages";
import { RendererLocationProvider } from "presentation/infrastructure/RendererLocationProvider";
import { ViewNames } from "common/ViewNames";

export abstract class ViewBase {
    public readonly window: BrowserWindow;
    public readonly messageBus: MessageBus;
    public readonly isReadyToShow$: BehaviorSubject<boolean>;

    constructor(
        viewName: ViewNames,
        protected presentationSettings: PresentationSettings,
        protected scaler: Scaler,
        protected hotkeysRegistry: HotkeysRegistry) {

        this.window = new BrowserWindow({
            frame: false,
            focusable: true,
            thickFrame: false,
            show: false,
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
            this.window.show();
        });
    }

    public hide(): void {
        this.window.hide();
    }

    protected scale(): void {
        this.window.setBounds(this.scaleBounds(this.window.getBounds()));
        this.messageBus.sendValue(Messages.ScaleFactor, this.scaler.scaleFactor$.value);
    }

    protected abstract scaleBounds(bounds: Electron.Rectangle): Electron.Rectangle;

    protected abstract getInitialBounds(): Electron.Rectangle;

    private initializeSubscriptions(): void {
        this.scaler.scaleFactor$.subscribe(this.scale.bind(this));
        this.messageBus.registerObservable(Messages.AccentColor, this.presentationSettings.accentColor$);

        this.window.on("focus", () => {
            this.hotkeysRegistry.registerZoomHotkeys();
        });
        this.window.on("blur", () => {
            this.hotkeysRegistry.unregisterZoomHotkeys();
        });
    }
}