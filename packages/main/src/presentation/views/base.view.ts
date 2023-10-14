import { BrowserWindow, screen, shell } from 'electron';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, first } from 'rxjs/operators';

import { ViewNames, Messages, Settings, DeepPartial } from '@selected-text-translate/common';

import { RendererLocationProvider } from '~/presentation/framework/renderer-location-provider.service';
import { ViewContext } from '~/presentation/framework/view-context.service';
import { ViewOptions } from '~/presentation/framework/view-options.interface';
import { IScaler } from '~/presentation/framework/scaling/scaling.interface';
import { MessageBus } from '~/presentation/framework/message-bus';

export abstract class BaseView {
  private readonly subscriptions: Subscription[] = [];

  protected readonly window: BrowserWindow;
  protected readonly isViewReady$ = new BehaviorSubject<boolean>(false);
  protected readonly messageBus: MessageBus;

  private scalerSubscription: Subscription | null = null;
  private isDisposed = false;
  protected scaler!: IScaler;

  public updateSettings$!: Observable<DeepPartial<Settings>>;

  constructor(
    public readonly viewName: ViewNames,
    protected readonly context: ViewContext,
    protected readonly viewOptions: ViewOptions
  ) {
    this.window = new BrowserWindow(this.getWindowSettings());
    this.messageBus = new MessageBus(
      this.window,
      this.registerSubscription.bind(this),
      this.onceViewReady.bind(this)
    );
    this.window.setMenu(null);
    this.setupApis();
    this.loadWindow();

    this.registerSubscription(
      viewOptions.isScalingEnabled
        .pipe(distinctUntilChanged())
        .subscribe(isScalingEnabled => this.setScaler(isScalingEnabled))
    );

    this.window.setBounds(this.getInitialBounds());

    this.window.once('closed', () => this.dispose());
    this.window.once('session-end', () => this.dispose());
  }

  public show(): void {
    if (this.window.isVisible()) {
      this.window.focus();
      return;
    }

    // Show offscreen to pre-render and prevent flickering
    this.onceViewReady(() => {
      const { x, y } = this.window.getBounds();
      const OFFSCREEN_OFFSET = -999999;
      this.window.setPosition(OFFSCREEN_OFFSET, OFFSCREEN_OFFSET);
      this.window.show();
      setTimeout(() => {
        this.window.setPosition(x, y);
      }, 10);
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
    const width = Math.round((primaryDisplay.bounds.width * widthPercent) / 100);
    const height = Math.round((primaryDisplay.bounds.height * heightPercent) / 100);

    return this.getCentralPositionAbsolute(width, height);
  }

  protected getCentralPositionAbsolute(width: number, height: number): Electron.Rectangle {
    const primaryDisplay = screen.getPrimaryDisplay();
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

  protected onceViewReady(callback: () => void): Subscription {
    return this.isViewReady$.pipe(first(isReady => isReady)).subscribe(callback);
  }

  private setScaler(isScalingEnabled: boolean): void {
    if (!!this.scalerSubscription) {
      this.scalerSubscription.unsubscribe();
    }
    this.scaler = this.context.scalerFactory.createScaler(isScalingEnabled);
    this.scalerSubscription = this.scaler.scaleFactor$.subscribe(scaleFactor =>
      this.scale(scaleFactor)
    );
  }

  private getWindowSettings(): Electron.BrowserWindowConstructorOptions {
    return {
      frame: !this.viewOptions.isFrameless,
      resizable: true,
      title: this.viewOptions.title,
      icon: !!this.viewOptions.iconName
        ? this.context.iconsProvider.getIconPath(this.viewOptions.iconName)
        : undefined,
      backgroundColor: '#ffffff',
      focusable: true,
      thickFrame: !this.viewOptions.isFrameless,
      show: false,
      webPreferences: {
        backgroundThrottling: false,
        contextIsolation: true,
        preload: RendererLocationProvider.getPreloadLocation()
      }
    };
  }

  private loadWindow(): void {
    this.window.loadURL(
      `${RendererLocationProvider.getRendererLocation()}#${this.viewName}?id=${this.window.id}`
    );
  }

  private scale(scaleFactor: number): void {
    this.window.setBounds(this.scaleBounds(this.window.getBounds()));
    this.messageBus.sendMessage(Messages.Main.Common.ScaleFactorChanged, scaleFactor);
  }

  private setupApis(): void {
    this.setupCoreApi();
    this.setupSettingsApi();
    this.setupLoggingApi();
    this.setupZoomApi();
  }

  private setupCoreApi(): void {
    this.messageBus.listenToMessage(Messages.Renderer.Common.ViewReady, () =>
      this.isViewReady$.next(true)
    );
    this.messageBus.listenToMessage(Messages.Renderer.Common.OpenDevToolsCommand, () =>
      this.window.webContents.openDevTools()
    );
    this.messageBus.listenToMessage(Messages.Renderer.Common.OpenUrl, (url: string) =>
      shell.openExternal(url)
    );
  }

  private setupSettingsApi(): void {
    this.messageBus.listenToMessage(
      Messages.Renderer.Common.GetAccentColor,
      () => this.context.accentColorProvider.accentColor$.value
    );
    this.messageBus.registerObservable(
      Messages.Main.Common.AccentColorChanged,
      this.context.accentColorProvider.accentColor$
    );

    this.messageBus.listenToMessage(
      Messages.Renderer.Common.GetFramelessState,
      () => this.viewOptions.isFrameless
    );
    this.messageBus.listenToMessage(
      Messages.Renderer.Common.GetScaleFactor,
      () => this.scaler.scaleFactor$.value
    );

    this.messageBus.listenToMessage(
      Messages.Renderer.Common.GetSettings,
      () => this.context.settings.value
    );
    this.messageBus.registerObservable(Messages.Main.Common.SettingsChanged, this.context.settings);
    this.updateSettings$ = this.messageBus.observeMessage<DeepPartial<Settings>>(
      Messages.Renderer.Common.UpdateSettingsCommand
    );
  }

  private setupZoomApi(): void {
    this.messageBus.listenToMessage(Messages.Renderer.Common.ZoomInCommand, () =>
      this.scaler.zoomIn()
    );
    this.messageBus.listenToMessage(Messages.Renderer.Common.ZoomOutCommand, () =>
      this.scaler.zoomOut()
    );
    this.messageBus.listenToMessage(Messages.Renderer.Common.ResetZoomCommand, () =>
      this.scaler.reset()
    );
  }

  private setupLoggingApi(): void {
    this.messageBus.listenToMessage(Messages.Renderer.Common.LogInfo, (message: string) =>
      this.context.logger.info(message)
    );
    this.messageBus.listenToMessage(Messages.Renderer.Common.LogWarning, (message: string) =>
      this.context.logger.warning(message)
    );
    this.messageBus.listenToMessage(
      Messages.Renderer.Common.LogError,
      (error: Error, message: string) => this.context.logger.error(message, error)
    );
    this.messageBus.listenToMessage(
      Messages.Renderer.Common.HandlerRendererErrorCommand,
      (error: Error, message?: string) =>
        this.context.errorHandler.handleError(this.viewName, error, message)
    );
  }

  private dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.isDisposed = true;

    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }

    if (!!this.scalerSubscription) {
      this.scalerSubscription.unsubscribe();
    }
  }
}
