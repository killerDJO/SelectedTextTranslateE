import { app, ipcMain } from "electron";
import { injectable, inject } from "inversify";
// tslint:disable-next-line:no-import-side-effect
import "reflect-metadata";

import { Taskbar } from "main/presentation/taskbar/Taskbar";
import { TranslationView } from "main/presentation/views/TranslationView";
import { SettingsView } from "main/presentation/views/SettingsView";
import { ScaleProvider } from "main/presentation/framework/ScaleProvider";
import { TextTranslator } from "main/business-logic/translation/TextTranslator";
import { HotkeysRegistry } from "main/presentation/hotkeys/HotkeysRegistry";
import { TextExtractor } from "main/business-logic/translation/TextExtractor";

@injectable()
export class Application {
    private taskbar!: Taskbar;

    private translationView: TranslationView;
    private settingsView: SettingsView;

    constructor(
        private readonly scaleProvider: ScaleProvider,
        private readonly textTranslator: TextTranslator,
        private readonly hotkeysRegistry: HotkeysRegistry,
        private readonly textExtractor: TextExtractor) {

        this.translationView = new TranslationView(scaleProvider);
        this.settingsView = new SettingsView(scaleProvider);

        this.createTaskbar();

        hotkeysRegistry.registerHotkeys();
        hotkeysRegistry.translate$.subscribe(() => {
            textExtractor.getSelectedText();
        });

        hotkeysRegistry.zoomIn$.subscribe(() => this.scaleProvider.zoomIn());
        hotkeysRegistry.zoomOut$.subscribe(() => this.scaleProvider.zoomOut());

        textExtractor.textToTranslate$.subscribe(text => {
            textTranslator.translate(text, false).subscribe(result => {
                this.translationView.showTranslateResult(result);
                this.translationView.show();
            });
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