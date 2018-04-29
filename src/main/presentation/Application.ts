import { app, ipcMain, SystemPreferences } from "electron";
import { injectable, inject } from "inversify";

import { Taskbar } from "presentation/Taskbar";
import { TranslationView } from "presentation/views/TranslationView";
import { SettingsView } from "presentation/views/SettingsView";
import { TextTranslator } from "business-logic/translation/TextTranslator";
import { HotkeysRegistry } from "presentation/hotkeys/HotkeysRegistry";
import { TextExtractor } from "business-logic/translation/TextExtractor";
import { PresentationSettings } from "presentation/settings/PresentationSettings";
import { TextPlayer } from "business-logic/translation/TextPlayer";
import { Scaler } from "presentation/infrastructure/Scaler";

@injectable()
export class Application {
    private taskbar!: Taskbar;

    private translationView!: TranslationView;
    private settingsView!: SettingsView;

    constructor(
        private readonly textTranslator: TextTranslator,
        private readonly textPlayer: TextPlayer,
        private readonly scaler: Scaler,
        private readonly presentationSettings: PresentationSettings,
        private readonly hotkeysRegistry: HotkeysRegistry,
        private readonly textExtractor: TextExtractor) {

        this.createViews(presentationSettings, scaler, hotkeysRegistry);
        this.createTaskbar();
        this.setupHotkeys(hotkeysRegistry, textExtractor);
    }

    private createViews(presentationSettings: PresentationSettings, scaler: Scaler, hotkeysRegistry: HotkeysRegistry): void {
        this.createTranslationView(presentationSettings, scaler, hotkeysRegistry);
        this.createSettingsView(presentationSettings, scaler, hotkeysRegistry);
    }

    private createTranslationView(presentationSettings: PresentationSettings, scaler: Scaler, hotkeysRegistry: HotkeysRegistry): void {
        this.translationView = new TranslationView(presentationSettings, scaler, hotkeysRegistry);

        this.translationView.playText$.subscribe(text => this.textPlayer.playText(text));
        this.translationView.translateText$.subscribe(text => this.translateText(text, false));
        this.translationView.forceTranslateText$.subscribe(text => this.translateText(text, true));
    }

    private createSettingsView(presentationSettings: PresentationSettings, scaler: Scaler, hotkeysRegistry: HotkeysRegistry): void {
        this.settingsView = new SettingsView(presentationSettings, scaler, hotkeysRegistry);
    }

    private setupHotkeys(hotkeysRegistry: HotkeysRegistry, textExtractor: TextExtractor): void {
        hotkeysRegistry.registerHotkeys();
        hotkeysRegistry.translate$.subscribe(() => {
            textExtractor.getSelectedText();
        });

        hotkeysRegistry.zoomIn$.subscribe(() => this.scaler.zoomIn());
        hotkeysRegistry.zoomOut$.subscribe(() => this.scaler.zoomOut());

        textExtractor.textToTranslate$.subscribe(text => this.translateText(text, false));
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

    private translateText(text: string, isForcedTranslation: boolean): void {
        this.textTranslator.translate(text, isForcedTranslation).subscribe(result => {
            this.translationView.showTranslateResult(result);
            this.translationView.show();
        });
    }
}