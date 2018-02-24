import { ViewBase } from "./ViewBase";
import { Event, app, BrowserWindow } from "electron";

export class SettingsView extends ViewBase {
    constructor() {
        super();

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