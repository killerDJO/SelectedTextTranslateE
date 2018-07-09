import { BrowserWindow, screen } from "electron";
import { BehaviorSubject, Subscription } from "rxjs";
import * as path from "path";

import { MessageBus } from "presentation/infrastructure/MessageBus";
import { Messages } from "common/messaging/Messages";
import { RendererLocationProvider } from "presentation/infrastructure/RendererLocationProvider";
import { ViewNames } from "common/ViewNames";
import { ViewContext } from "presentation/framework/ViewContext";
import { ViewOptions } from "presentation/framework/ViewOptions";

export abstract class ViewBase {
    private readonly subscriptions: Subscription[] = [];

    protected readonly window: BrowserWindow;
    protected readonly messageBus: MessageBus;
    protected readonly isReadyToShow$: BehaviorSubject<boolean>;

    constructor(
        public readonly viewName: ViewNames,
        protected readonly context: ViewContext,
        protected readonly viewOptions: ViewOptions) {

        this.window = new BrowserWindow(this.getWindowSettings());
        //this.window.setMenu(null);
        this.isReadyToShow$ = new BehaviorSubject<boolean>(false);
        this.loadWindow();

        this.messageBus = new MessageBus(this.window);
        this.messageBus.sendValue(Messages.IsFramelessWindow, this.viewOptions.isFrameless);

        this.initializeSubscriptions();
        this.window.setBounds(this.getInitialBounds());
    }

    public show(): void {
        this.isReadyToShow$.filter(isReady => isReady).subscribe(() => {
            setTimeout(() => this.window.show(), 75);
        });
    }

    public hide(): void {
        this.window.hide();
    }

    public isDestroyed(): boolean {
        return this.window.isDestroyed();
    }

    protected scale(): void {
        this.window.setBounds(this.scaleBounds(this.window.getBounds()));
        this.messageBus.sendValue(Messages.ScaleFactor, this.context.scaler.scaleFactor$.value);
    }

    protected scaleBounds(bounds: Electron.Rectangle): Electron.Rectangle {
        const width = this.context.scaler.rescale(bounds.width);
        const height = this.context.scaler.rescale(bounds.height);
        const widthDelta = Math.round((width - bounds.width) / 2);
        const heightDelta = Math.round((height - bounds.height) / 2);
        return {
            width: width,
            height: height,
            x: bounds.x - widthDelta,
            y: bounds.y - heightDelta
        };
    }

    protected getCentralPosition(width: number, height: number): Electron.Rectangle {
        const primaryDisplay = screen.getPrimaryDisplay();
        const scaledWidth = this.context.scaler.scale(width);
        const scaledHeight = this.context.scaler.scale(height);
        const x = Math.round(primaryDisplay.bounds.width / 2 - scaledWidth / 2);
        const y = Math.round(primaryDisplay.bounds.height / 2) - scaledHeight / 2;

        return {
            x: x,
            y: y,
            width: width,
            height: height
        };
    }

    protected abstract getInitialBounds(): Electron.Rectangle;

    private getWindowSettings(): Electron.BrowserWindowConstructorOptions {
        return {
            frame: !this.viewOptions.isFrameless,
            resizable: true,
            title: this.viewOptions.title,
            icon: !!this.viewOptions.iconName ? this.context.iconsProvider.getIconPath(this.viewOptions.iconName) : undefined,
            backgroundColor: "#ffffff",
            focusable: true,
            thickFrame: !this.viewOptions.isFrameless,
            show: false,
            webPreferences: {
                backgroundThrottling: false,
                affinity: "window"
            }
        };
    }

    private loadWindow(): void {
        this.window.loadURL(`${RendererLocationProvider.getRendererLocation()}#${this.viewName}`);
    }

    private initializeSubscriptions(): void {
        this.registerSubscription(this.context.scaler.scaleFactor$.subscribe(this.scale.bind(this)));
        this.messageBus.registerObservable(Messages.AccentColor, this.context.accentColorProvider.accentColor$);
        this.messageBus.getValue<Error>(Messages.RendererError).subscribe(error => this.context.errorHandler.handlerError(this.viewName, error));

        this.window.on("focus", () => {
            this.context.zoomHotkeysRegistry.registerZoomHotkeys();
        });
        this.window.on("blur", () => {
            this.context.zoomHotkeysRegistry.unregisterZoomHotkeys();
        });
        this.window.once("ready-to-show", () => this.isReadyToShow$.next(true));
        this.window.once("closed", () => this.destroy());
    }

    private registerSubscription(subscription: Subscription): void {
        this.subscriptions.push(subscription);
    }

    private destroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
        this.messageBus.destroy();
    }
}