import { app } from "electron";

import { Application } from "main/presentation/Application";
import { ScaleProvider } from "./presentation/framework/ScaleProvider";
import { TranslatePageParser } from "./business-logic/translation/TranslatePageParser";
import { TextTranslator } from "./business-logic/translation/TextTranslator";
import { HotkeysRegistry } from "./presentation/hotkeys/HotkeysRegistry";
import { TextExtractor } from "./business-logic/translation/TextExtractor";
import { container } from "main/inversify.config";

let application: Application;
app.on("ready", () => {
    application = container.get<Application>(Application);
});