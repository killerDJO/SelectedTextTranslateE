import { Container } from 'inversify';

import { RendererLocationProvider } from '~/presentation/framework/renderer-location-provider.service';
import { Application } from '~/presentation/application.service';
import { AccentColorProvider } from '~/presentation/framework/accent-color-provider.service';
import { HotkeysRegistry } from '~/presentation/hotkeys/hotkeys-registry.service';
import { Scaler } from '~/presentation/framework/scaling/scaler.service';
import { ViewContext } from '~/presentation/framework/view-context.service';
import { RendererErrorHandler } from '~/presentation/framework/renderer-error-handler.service';
import { IconsProvider } from '~/presentation/framework/icons-provider.service';
import { ViewsRegistry } from '~/presentation/views/views-registry.service';
import { NullScaler } from '~/presentation/framework/scaling/null-scaler.service';
import { ScalerFactory } from '~/presentation/framework/scaling/scaler-factory.service';
import { SettingsProvider } from '~/infrastructure/settings-provider.service';
import { TextExtractor } from '~/services/text-extractor.service';
import { StartupItemsProvider } from '~/install/startup-items-provider.service';
import { StartupHandler } from '~/install/startup-handler.service';
import { Updater } from '~/install/updater.service';
import { Installer } from '~/install/installer.service';
import { NotificationSender } from '~/infrastructure/notification-sender.service';
import { ErrorHandler } from '~/infrastructure/error-handler.service';
import { Logger } from '~/infrastructure/logger.service';
import { StorageFolderProvider } from '~/infrastructure/storage-folder-provider.service';
import { RequestProvider } from '~/services/request-provider.service';

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
