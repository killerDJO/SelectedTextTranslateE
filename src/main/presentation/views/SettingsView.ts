import { Event, app, BrowserWindow } from "electron";
import { injectable, inject } from "inversify";

import { PresentationSettings } from "main/presentation/settings/PresentationSettings";
import { ViewBase } from "main/presentation/views/ViewBase";

@injectable()
export class SettingsView extends ViewBase {
    constructor(presentationSettings: PresentationSettings) {
        super(presentationSettings);

        this.initialize(new BrowserWindow({
            width: 600,
            height: 600,
            frame: true,
            focusable: true,
            skipTaskbar: false,
            thickFrame: true,
            alwaysOnTop: false,
            title: "Settings",
            show: false
        }));

        this.window.on("close", (event: Event) => {
            event.preventDefault();
            this.window.hide();
        });

        app.on("before-quit", () => {
            this.window.removeAllListeners("close");
        });
    }
}