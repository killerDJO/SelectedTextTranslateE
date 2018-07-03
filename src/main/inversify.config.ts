import { Container } from "inversify";

import { RequestProvider } from "data-access/RequestProvider";
import { SqLiteProvider } from "data-access/SqLiteProvider";

import { DictionaryProvider } from "business-logic/dictionary/DictionaryProvider";
import { HashProvider } from "business-logic/translation/HashProvider";
import { TextExtractor } from "business-logic/translation/TextExtractor";
import { TextTranslator } from "business-logic/translation/TextTranslator";
import { TranslatePageParser } from "business-logic/translation/TranslatePageParser";
import { TranslationResponseParser } from "business-logic/translation/TranslationResponseParser";
import { TextPlayer } from "business-logic/translation/TextPlayer";

import { MessageBus } from "presentation/infrastructure/MessageBus";
import { RendererLocationProvider } from "presentation/infrastructure/RendererLocationProvider";
import { Application } from "presentation/Application";
import { AccentColorProvider } from "presentation/framework/AccentColorProvider";
import { HotkeysRegistry } from "presentation/hotkeys/HotkeysRegistry";
import { Scaler } from "presentation/framework/Scaler";
import { StorageFolderProvider } from "infrastructure/StorageFolderProvider";
import { Logger } from "infrastructure/Logger";
import { ErrorHandler } from "infrastructure/ErrorHandler";
import { SettingsStore } from "infrastructure/SettingsStore";
import { ViewContext } from "presentation/framework/ViewContext";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { NotificationSender } from "infrastructure/NotificationSender";
import { RendererErrorHandler } from 'presentation/infrastructure/RendererErrorHandler';

class Binder {
    public readonly container: Container = new Container();

    constructor() {
        this.bindInfrastructure();
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

    private bindDataAccess(): void {
        this.container.bind<RequestProvider>(RequestProvider).toSelf();
        this.container.bind<SqLiteProvider>(SqLiteProvider).toSelf();
    }

    private bindBusinessLogic(): void {
        this.container.bind<DictionaryProvider>(DictionaryProvider).toSelf().inSingletonScope();
        this.container.bind<HashProvider>(HashProvider).toSelf();
        this.container.bind<TextExtractor>(TextExtractor).toSelf();
        this.container.bind<TextTranslator>(TextTranslator).toSelf();
        this.container.bind<TranslatePageParser>(TranslatePageParser).toSelf();
        this.container.bind<TranslationResponseParser>(TranslationResponseParser).toSelf();
        this.container.bind<TextPlayer>(TextPlayer).toSelf();
        this.container.bind<SettingsProvider>(SettingsProvider).toSelf();
    }

    private bindPresentation(): void {
        this.container.bind<AccentColorProvider>(AccentColorProvider).toSelf().inSingletonScope();
        this.container.bind<MessageBus>(MessageBus).toSelf().inSingletonScope();
        this.container.bind<RendererLocationProvider>(RendererLocationProvider).toSelf();
        this.container.bind<ViewContext>(ViewContext).toSelf();
        this.container.bind<HotkeysRegistry>(HotkeysRegistry).toSelf().inSingletonScope();
        this.container.bind<Scaler>(Scaler).toSelf().inSingletonScope();
        this.container.bind<RendererErrorHandler>(RendererErrorHandler).toSelf().inSingletonScope();
    }
}

const container = new Binder().container;

export { container };