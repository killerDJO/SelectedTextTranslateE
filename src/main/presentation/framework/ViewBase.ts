import { BrowserWindow, screen } from "electron";
import { BehaviorSubject, Subscription } from "rxjs";

import { MessageBus } from "presentation/infrastructure/MessageBus";
import { Messages } from "common/messaging/Messages";
import { RendererLocationProvider } from "presentation/infrastructure/RendererLocationProvider";
import { ViewNames } from "common/ViewNames";
import { ViewContext } from "presentation/framework/ViewContext";
import { ViewOptions } from "presentation/framework/ViewOptions";
import { IScaler } from "presentation/framework/scaling/IScaler";
import { distinctUntilChanged, filter, first } from "rxjs/operators";

export abstract class ViewBase {
    private readonly subscriptions: Subscription[] = [];
    private readonly showDelayMilliseconds: number;

    protected readonly window: BrowserWindow;
    protected readonly messageBus: MessageBus;
    protected readonly isReadyToShow$: BehaviorSubject<boolean>;
    protected readonly isShowInProgress$: BehaviorSubject<boolean>;

    private scalerSubscription: Subscription | null = null;
    protected scaler!: IScaler;

    constructor(
        public readonly viewName: ViewNames,
        protected readonly context: ViewContext,
        protected readonly viewOptions: ViewOptions) {

        this.showDelayMilliseconds = context.viewsSettings.engine.showDelayMilliseconds;

        this.window = new BrowserWindow(this.getWindowSettings());
        this.window.setMenu(null);
        this.isReadyToShow$ = new BehaviorSubject<boolean>(false);
        this.isShowInProgress$ = new BehaviorSubject<boolean>(false);
        this.loadWindow();

        this.messageBus = new MessageBus(this.window);
        this.messageBus.sendValue(Messages.Common.IsFramelessWindow, this.viewOptions.isFrameless);
        this.registerSubscription(this.messageBus.registerObservable(Messages.Common.RendererSettings, this.context.rendererSettings).subscription);
        this.registerSubscription(viewOptions.isScalingEnabled.pipe(distinctUntilChanged()).subscribe(isScalingEnabled => this.setScaler(isScalingEnabled)));

        this.initializeSubscriptions();
        this.window.setBounds(this.getInitialBounds());
    }

    public show(): void {
        if (this.window.isVisible()) {
            this.window.restore();
            this.window.moveTop();
            return;
        }

        // Show offscreen to pre-render and prevent flickering
        this.isReadyToShow$.pipe(first(isReady => isReady)).subscribe(() => {
            this.isShowInProgress$.next(true);
            const { x, y, width, height } = this.window.getBounds();
            this.window.setPosition(-width, -height);
            this.window.show();
            setTimeout(
                () => {
                    this.window.setPosition(x, y);
                    this.isShowInProgress$.next(false);
                },
                this.showDelayMilliseconds);
        });
    }

    public hide(): void {
        this.onShowCompleted(() => {
            this.window.hide();
        });
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

    private onShowCompleted(callback: () => void) {
        return this.isShowInProgress$.pipe(first(isInProgress => !isInProgress)).subscribe(callback);
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
        this.messageBus.registerObservable(Messages.Common.AccentColor, this.context.accentColorProvider.accentColor$);
        this.messageBus.getValue<Error>(Messages.Common.RendererError).subscribe(error => this.context.errorHandler.handlerError(this.viewName, error));
        this.messageBus.getValue<void>(Messages.Common.ZoomInCommand).subscribe(() => this.scaler.zoomIn());
        this.messageBus.getValue<void>(Messages.Common.ZoomOutCommand).subscribe(() => this.scaler.zoomOut());
        this.messageBus.getValue<void>(Messages.Common.ResetZoomCommand).subscribe(() => this.scaler.reset());
        this.window.once("ready-to-show", () => this.isReadyToShow$.next(true));
        this.window.once("closed", () => this.destroy());
    }

    private scale(scaleFactor: number): void {
        this.onShowCompleted(() => {
            this.window.setBounds(this.scaleBounds(this.window.getBounds()));
            this.messageBus.sendValue(Messages.Common.ScaleFactor, scaleFactor);
        });
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