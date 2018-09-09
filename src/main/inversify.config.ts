import { Container } from "inversify";

import { StorageFolderProvider } from "infrastructure/StorageFolderProvider";
import { Logger } from "infrastructure/Logger";
import { ErrorHandler } from "infrastructure/ErrorHandler";
import { SettingsStore } from "infrastructure/SettingsStore";
import { NotificationSender } from "infrastructure/NotificationSender";

import { Installer } from "install/Installer";
import { Updater } from "install/Updater";
import { StartupHandler } from "install/StartupHandler";
import { StartupItemsProvider } from "install/StartupItemsProvider";

import { RequestProvider } from "data-access/RequestProvider";
import { DatastoreProvider } from "data-access/DatastoreProvider";

import { HistoryStore } from "business-logic/history/HistoryStore";
import { HashProvider } from "business-logic/translation/HashProvider";
import { TextExtractor } from "business-logic/translation/TextExtractor";
import { TextTranslator } from "business-logic/translation/TextTranslator";
import { TranslatePageParser } from "business-logic/translation/TranslatePageParser";
import { TranslationResponseParser } from "business-logic/translation/TranslationResponseParser";
import { TextPlayer } from "business-logic/translation/TextPlayer";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { SearchExecutor } from "business-logic/search/SearchExecutor";

import { MessageBus } from "presentation/infrastructure/MessageBus";
import { RendererLocationProvider } from "presentation/infrastructure/RendererLocationProvider";
import { Application } from "presentation/Application";
import { AccentColorProvider } from "presentation/framework/AccentColorProvider";
import { HotkeysRegistry } from "presentation/hotkeys/HotkeysRegistry";
import { Scaler } from "presentation/framework/scaling/Scaler";
import { ViewContext } from "presentation/framework/ViewContext";
import { RendererErrorHandler } from "presentation/infrastructure/RendererErrorHandler";
import { IconsProvider } from "presentation/infrastructure/IconsProvider";
import { ViewsRegistry } from "presentation/views/ViewsRegistry";
import { NullScaler } from "presentation/framework/scaling/NullScaler";
import { ScalerFactory } from "presentation/framework/scaling/ScalerFactory";

class Binder {
    public readonly container: Container = new Container();

    constructor() {
        this.bindInfrastructure();
        this.bindInstall();
        this.bindDataAccess();
        this.bindBusinessLogic();
        this.bindPresentation();

        this.container.bind<Application>(Application).toSelf();
    }

    private bindInfrastructure(): void {
        this.container.bind<StorageFolderProvider>(StorageFolderProvider).toSelf();
        this.container.bind<NotificationSender>(NotificationSender).toSelf();
        this.container.bind<Logger>(Logger).toSelf().inSingletonScope();
        this.container.bind<ErrorHandler>(ErrorHandler).toSelf().inSingletonScope();
        this.container.bind<SettingsStore>(SettingsStore).toSelf().inSingletonScope();
    }

    private bindInstall(): void {
        this.container.bind<Installer>(Installer).toSelf().inSingletonScope();
        this.container.bind<Updater>(Updater).toSelf().inSingletonScope();
        this.container.bind<StartupHandler>(StartupHandler).toSelf().inSingletonScope();
        this.container.bind<StartupItemsProvider>(StartupItemsProvider).toSelf().inSingletonScope();
    }

    private bindDataAccess(): void {
        this.container.bind<RequestProvider>(RequestProvider).toSelf();
        this.container.bind<DatastoreProvider>(DatastoreProvider).toSelf();
    }

    private bindBusinessLogic(): void {
        this.container.bind<HistoryStore>(HistoryStore).toSelf().inSingletonScope();
        this.container.bind<HashProvider>(HashProvider).toSelf();
        this.container.bind<TextExtractor>(TextExtractor).toSelf();
        this.container.bind<TextTranslator>(TextTranslator).toSelf();
        this.container.bind<TranslatePageParser>(TranslatePageParser).toSelf().inSingletonScope();
        this.container.bind<TranslationResponseParser>(TranslationResponseParser).toSelf();
        this.container.bind<TextPlayer>(TextPlayer).toSelf();
        this.container.bind<SettingsProvider>(SettingsProvider).toSelf().inSingletonScope();
        this.container.bind<SearchExecutor>(SearchExecutor).toSelf().inSingletonScope();
    }

    private bindPresentation(): void {
        this.container.bind<AccentColorProvider>(AccentColorProvider).toSelf().inSingletonScope();
        this.container.bind<MessageBus>(MessageBus).toSelf().inSingletonScope();
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