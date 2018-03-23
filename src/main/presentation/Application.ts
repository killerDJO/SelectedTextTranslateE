import { app, ipcMain, SystemPreferences } from "electron";
import { injectable, inject } from "inversify";

import { Taskbar } from "main/presentation/Taskbar";
import { TranslationView } from "main/presentation/views/TranslationView";
import { SettingsView } from "main/presentation/views/SettingsView";
import { TextTranslator } from "main/business-logic/translation/TextTranslator";
import { HotkeysRegistry } from "main/presentation/hotkeys/HotkeysRegistry";
import { TextExtractor } from "main/business-logic/translation/TextExtractor";
import { PresentationSettings } from "main/presentation/settings/PresentationSettings";
import { TextPlayer } from "main/business-logic/translation/TextPlayer";
import { Scaler } from "main/presentation/infrastructure/Scaler";

@injectable()
export class Application {
    private taskbar!: Taskbar;

    private translationView: TranslationView;
    private settingsView: SettingsView;

    constructor(
        private readonly textTranslator: TextTranslator,
        private readonly textPlayer: TextPlayer,
        private readonly scaler: Scaler,
        private readonly presentationSettings: PresentationSettings,
        private readonly hotkeysRegistry: HotkeysRegistry,
        private readonly textExtractor: TextExtractor) {

        this.translationView = new TranslationView(presentationSettings, scaler, hotkeysRegistry);
        this.settingsView = new SettingsView(presentationSettings, scaler, hotkeysRegistry);

        this.createTaskbar();

        hotkeysRegistry.registerHotkeys();
        hotkeysRegistry.translate$.subscribe(() => {
            textExtractor.getSelectedText();
        });

        hotkeysRegistry.zoomIn$.subscribe(() => this.scaler.zoomIn());
        hotkeysRegistry.zoomOut$.subscribe(() => this.scaler.zoomOut());

        textExtractor.textToTranslate$.subscribe(text => this.translateText(text, false));

        this.translationView.playText$.subscribe(text => this.textPlayer.playText(text));
        this.translationView.translateText$.subscribe(text => this.translateText(text, false));
        this.translationView.forceTranslateText$.subscribe(text => this.translateText(text, true));
    }

    private translateText(text: string, isForcedTranslation: boolean): void {
        this.textTranslator.translate(text, isForcedTranslation).subscribe(result => {
            this.translationView.showTranslateResult(result);
            this.translationView.show();
        });
    }

    private createTaskbar(): void {
        this.taskbar = new Taskbar();

        this.taskbar.showTranslation$.subscribe(() => {
            this.settingsView.hide();
            this.translationView.show();
        });

        this.taskbar.showSettings$.subscribe(() => {
            this.settingsView.show();
            this.translationView.hide();
        });
    }
}