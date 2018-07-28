import { BrowserWindow, screen } from "electron";
import { BehaviorSubject, Subscription, Observable } from "rxjs";

import { MessageBus } from "presentation/infrastructure/MessageBus";
import { Messages } from "common/messaging/Messages";
import { RendererLocationProvider } from "presentation/infrastructure/RendererLocationProvider";
import { ViewNames } from "common/ViewNames";
import { ViewContext } from "presentation/framework/ViewContext";
import { ViewOptions } from "presentation/framework/ViewOptions";
import { IScaler } from "presentation/framework/scaling/IScaler";

export abstract class ViewBase {
    private readonly subscriptions: Subscription[] = [];

    protected readonly window: BrowserWindow;
    protected readonly messageBus: MessageBus;
    protected readonly isReadyToShow$: BehaviorSubject<boolean>;

    private scalerSubscription: Subscription | null = null;
    protected scaler!: IScaler;

    constructor(
        public readonly viewName: ViewNames,
        protected readonly context: ViewContext,
        protected readonly viewOptions: ViewOptions) {

        this.window = new BrowserWindow(this.getWindowSettings());
        this.window.setMenu(null);
        this.isReadyToShow$ = new BehaviorSubject<boolean>(false);
        this.loadWindow();

        this.messageBus = new MessageBus(this.window);
        this.messageBus.sendValue(Messages.IsFramelessWindow, this.viewOptions.isFrameless);
        this.registerSubscription(this.messageBus.registerObservable(Messages.RendererSettings, this.context.rendererSettings));
        this.registerSubscription(viewOptions.isScalingEnabled.distinctUntilChanged().subscribe(isScalingEnabled => this.setScaler(isScalingEnabled)));

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

    protected scaleBounds(bounds: Electron.Rectangle): Electron.Rectangle {
        return bounds;
    }

    protected getCentralPosition(widthPercent: number, heightPercent: number): Electron.Rectangle {
        const primaryDisplay = screen.getPrimaryDisplay();
        const width = Math.round(primaryDisplay.bounds.width * widthPercent / 100);
        const height = Math.round(primaryDisplay.bounds.height * heightPercent / 100);
        const x = Math.round(primaryDisplay.bounds.width / 2 - width / 2);
        const y = Math.round(primaryDisplay.bounds.height / 2 - height / 2);

        return {
            x: x,
            y: y,
            width: width,
            height: height
        };
    }

    protected abstract getInitialBounds(): Electron.Rectangle;

    protected registerSubscription(subscription: Subscription): void {
        this.subscriptions.push(subscription);
    }

    private setScaler(isScalingEnabled: boolean): void {
        if (!!this.scalerSubscription) {
            this.scalerSubscription.unsubscribe();
        }
        this.scaler = this.context.scalerFactory.createScaler(isScalingEnabled);
        this.scalerSubscription = this.scaler.scaleFactor$.subscribe(scaleFactor => this.scale(scaleFactor));
    }

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
        this.messageBus.registerObservable(Messages.AccentColor, this.context.accentColorProvider.accentColor$);
        this.messageBus.getValue<Error>(Messages.RendererError).subscribe(error => this.context.errorHandler.handlerError(this.viewName, error));
        this.messageBus.getValue<void>(Messages.ZoomInCommand).subscribe(() => this.scaler.zoomIn());
        this.messageBus.getValue<void>(Messages.ZoomOutCommand).subscribe(() => this.scaler.zoomOut());
        this.window.once("ready-to-show", () => this.isReadyToShow$.next(true));
        this.window.once("closed", () => this.destroy());
    }

    private scale(scaleFactor: number): void {
        this.window.setBounds(this.scaleBounds(this.window.getBounds()));
        this.messageBus.sendValue(Messages.ScaleFactor, scaleFactor);
    }

    private destroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }

        if (!!this.scalerSubscription) {
            this.scalerSubscription.unsubscribe();
        }

        this.messageBus.destroy();
    }
}