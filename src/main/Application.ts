import { app, ipcMain } from "electron";
import { Taskbar } from "./presentation/taskbar/Taskbar";
import { TranslationView } from "./presentation/views/TranslationView";
import { SettingsView } from "./presentation/views/SettingsView";
import { TextExtractor } from "./business-logic/translation/TextExtractor";
import { HotkeysRegistry } from "./presentation/hotkeys/HotkeysRegistry";
import { TextTranslator } from "./business-logic/translation/TextTranslator";

class Application {
    private taskbar!: Taskbar;

    private translationView: TranslationView;
    private settingsView: SettingsView;

    constructor() {
        this.translationView = new TranslationView();
        this.settingsView = new SettingsView();

        this.createTaskbar();

        const hotkeysRegistry = new HotkeysRegistry();
        const textExtractor = new TextExtractor();
        hotkeysRegistry.registerHotkeys();
        hotkeysRegistry.OnTranslate.subscribe(() => {
            textExtractor.getSelectedText();
        });

        const textTranslator = new TextTranslator();
        textExtractor.TextToTranslate.subscribe(text => {
            textTranslator.translate("test").subscribe(result => {
                this.translationView.showTranslateResult(result);
                this.translationView.show();
            });
        });
    }

    private createTaskbar(): void {
        this.taskbar = new Taskbar();

        this.taskbar.OnShowTranslation.subscribe(() => {
            this.settingsView.hide();
            this.translationView.show();
        });

        this.taskbar.OnShowSettings.subscribe(() => {
            this.settingsView.show();
            this.translationView.hide();
        });
    }
}

let application: Application;
app.on("ready", () => {
    application = new Application();
});