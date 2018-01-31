import { app } from "electron";
import { Taskbar } from "./taskbar/Taskbar";
import { TranslationView } from "./views/TranslationView";
import { SettingsView } from "./views/SettingsView";

class Application {
    private taskbar: Taskbar;

    private translationView: TranslationView;
    private settingsView: SettingsView;

    constructor() {
        this.translationView = new TranslationView();
        this.settingsView = new SettingsView();

        this.createTaskbar();
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