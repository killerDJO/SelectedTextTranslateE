import { Container } from "inversify";

import { RequestProvider } from "main/data-access/RequestProvider";
import { SqLiteProvider } from "main/data-access/SqLiteProvider";

import { DictionaryProvider } from "main/business-logic/dictionary/DictionaryProvider";
import { HashProvider } from "main/business-logic/translation/HashProvider";
import { TextExtractor } from "main/business-logic/translation/TextExtractor";
import { TextTranslator } from "main/business-logic/translation/TextTranslator";
import { TranslatePageParser } from "main/business-logic/translation/TranslatePageParser";
import { TranslationResponseParser } from "main/business-logic/translation/TranslationResponseParser";
import { TextPlayer } from "main/business-logic/translation/TextPlayer";

import { MessageBus } from "main/presentation/infrastructure/MessageBus";
import { RendererLocationProvider } from "main/presentation/infrastructure/RendererLocationProvider";
import { Application } from "main/presentation/Application";
import { PresentationSettings } from "main/presentation/settings/PresentationSettings";
import { HotkeysRegistry } from "main/presentation/hotkeys/HotkeysRegistry";
import { Scaler } from "main/presentation/infrastructure/Scaler";

class Binder {
    public readonly container: Container = new Container();

    constructor() {
        this.bindDataAccess();
        this.bindBusinessLogic();
        this.bindPresentation();

        this.container.bind<Application>(Application).toSelf();
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
    }

    private bindPresentation(): void {
        this.container.bind<PresentationSettings>(PresentationSettings).toSelf().inSingletonScope();
        this.container.bind<MessageBus>(MessageBus).toSelf().inSingletonScope();
        this.container.bind<RendererLocationProvider>(RendererLocationProvider).toSelf();
        this.container.bind<HotkeysRegistry>(HotkeysRegistry).toSelf().inSingletonScope();
        this.container.bind<Scaler>(Scaler).toSelf().inSingletonScope();
    }
}

const container = new Binder().container;

export { container };