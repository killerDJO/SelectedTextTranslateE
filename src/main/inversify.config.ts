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
import { PresentationSettings } from "presentation/settings/PresentationSettings";
import { HotkeysRegistry } from "presentation/hotkeys/HotkeysRegistry";
import { Scaler } from "presentation/infrastructure/Scaler";

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