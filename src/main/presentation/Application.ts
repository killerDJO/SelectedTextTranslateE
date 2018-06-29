import { app, ipcMain, SystemPreferences } from "electron";
import { injectable, inject } from "inversify";

import { Taskbar } from "presentation/Taskbar";
import { TranslationView } from "presentation/views/TranslationView";
import { SettingsView } from "presentation/views/SettingsView";
import { TextTranslator } from "business-logic/translation/TextTranslator";
import { TextExtractor } from "business-logic/translation/TextExtractor";
import { TextPlayer } from "business-logic/translation/TextPlayer";
import { StorageFolderProvider } from "infrastructure/StorageFolderProvider";
import { ViewContext } from "presentation/framework/ViewContext";
import { Scaler } from "presentation/framework/Scaler";
import { HotkeysRegistry } from "presentation/hotkeys/HotkeysRegistry";

@injectable()
export class Application {
    private taskbar!: Taskbar;

    private translationView!: TranslationView;
    private settingsView!: SettingsView;

    constructor(
        private readonly textTranslator: TextTranslator,
        private readonly textPlayer: TextPlayer,
        private readonly viewContext: ViewContext,
        private readonly hotkeysRegistry: HotkeysRegistry,
        private readonly scaler: Scaler,
        private readonly textExtractor: TextExtractor,
        private readonly storageFolderProvider: StorageFolderProvider) {

        this.createViews();
        this.createTaskbar();
        this.setupHotkeys();
    }

    private createViews(): void {
        this.createTranslationView();
        this.createSettingsView();
    }

    private createTranslationView(): void {
        this.translationView = new TranslationView(this.viewContext);

        this.translationView.playText$.subscribe(text => this.textPlayer.playText(text));
        this.translationView.translateText$.subscribe(text => this.translateText(text, false));
        this.translationView.forceTranslateText$.subscribe(text => this.translateText(text, true));
    }

    private createSettingsView(): void {
        this.settingsView = new SettingsView(this.viewContext);
    }

    private setupHotkeys(): void {
        this.hotkeysRegistry.registerHotkeys();
        this.hotkeysRegistry.translate$.subscribe(() => {
            this.textExtractor.getSelectedText();
        });

        this.hotkeysRegistry.zoomIn$.subscribe(() => this.viewContext.scaler.zoomIn());
        this.hotkeysRegistry.zoomOut$.subscribe(() => this.viewContext.scaler.zoomOut());

        this.textExtractor.textToTranslate$.subscribe(text => this.translateText(text, false));
    }

    private createTaskbar(): void {
        this.taskbar = new Taskbar(this.storageFolderProvider);

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