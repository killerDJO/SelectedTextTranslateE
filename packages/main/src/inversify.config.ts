import { Container } from 'inversify';

import { RendererLocationProvider } from '~/presentation/framework/RendererLocationProvider';
import { Application } from '~/presentation/Application';
import { AccentColorProvider } from '~/presentation/framework/AccentColorProvider';
import { HotkeysRegistry } from '~/presentation/hotkeys/HotkeysRegistry';
import { Scaler } from '~/presentation/framework/scaling/Scaler';
import { ViewContext } from '~/presentation/framework/ViewContext';
import { RendererErrorHandler } from '~/presentation/framework/RendererErrorHandler';
import { IconsProvider } from '~/presentation/framework/IconsProvider';
import { ViewsRegistry } from '~/presentation/views/ViewsRegistry';
import { NullScaler } from '~/presentation/framework/scaling/NullScaler';
import { ScalerFactory } from '~/presentation/framework/scaling/ScalerFactory';
import { SettingsProvider } from '~/infrastructure/SettingsProvider';
import { TextExtractor } from '~/services/TextExtractor';
import { StartupItemsProvider } from '~/install/StartupItemsProvider';
import { StartupHandler } from '~/install/StartupHandler';
import { Updater } from '~/install/Updater';
import { Installer } from '~/install/Installer';
import { NotificationSender } from '~/infrastructure/NotificationSender';
import { ErrorHandler } from '~/infrastructure/ErrorHandler';
import { Logger } from '~/infrastructure/Logger';
import { StorageFolderProvider } from '~/infrastructure/StorageFolderProvider';
import { RequestProvider } from '~/services/RequestProvider';

class Binder {
  public readonly container: Container = new Container({ skipBaseClassChecks: true });

  constructor() {
    this.bindInfrastructure();
    this.bindInstall();
    this.bindServices();
    this.bindPresentation();

    this.container.bind<Application>(Application).toSelf();
  }

  private bindInfrastructure(): void {
    this.container.bind<StorageFolderProvider>(StorageFolderProvider).toSelf();
    this.container.bind<NotificationSender>(NotificationSender).toSelf();
    this.container.bind<Logger>(Logger).toSelf().inSingletonScope();
    this.container.bind<ErrorHandler>(ErrorHandler).toSelf().inSingletonScope();
    this.container.bind<SettingsProvider>(SettingsProvider).toSelf().inSingletonScope();
  }

  private bindInstall(): void {
    this.container.bind<Installer>(Installer).toSelf().inSingletonScope();
    this.container.bind<Updater>(Updater).toSelf().inSingletonScope();
    this.container.bind<StartupHandler>(StartupHandler).toSelf().inSingletonScope();
    this.container.bind<StartupItemsProvider>(StartupItemsProvider).toSelf().inSingletonScope();
  }

  private bindServices(): void {
    this.container.bind<RequestProvider>(RequestProvider).toSelf();
    this.container.bind<TextExtractor>(TextExtractor).toSelf();
  }

  private bindPresentation(): void {
    this.container.bind<AccentColorProvider>(AccentColorProvider).toSelf().inSingletonScope();
    this.container.bind<RendererLocationProvider>(RendererLocationProvider).toSelf();
    this.container.bind<ViewContext>(ViewContext).toSelf();
    this.container.bind<HotkeysRegistry>(HotkeysRegistry).toSelf().inSingletonScope();
    this.container.bind<Scaler>(Scaler).toSelf().inSingletonScope();
    this.container.bind<NullScaler>(NullScaler).toSelf().inSingletonScope();
    this.container.bind<ScalerFactory>(ScalerFactory).toSelf();
    this.container.bind<RendererErrorHandler>(RendererErrorHandler).toSelf().inSingletonScope();
    this.container.bind<IconsProvider>(IconsProvider).toSelf().inSingletonScope();
    this.container.bind<ViewsRegistry>(ViewsRegistry).toSelf().inSingletonScope();
  }
}

const container = new Binder().container;

export { container };
