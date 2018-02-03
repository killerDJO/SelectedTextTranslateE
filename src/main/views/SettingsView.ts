import { ViewBase } from "./ViewBase";
import { Event } from "electron";

export class SettingsView extends ViewBase {
    constructor() {
        super(
            {
                width: 600,
                height: 600,
                frame: true,
                focusable: true,
                skipTaskbar: false,
                thickFrame: true,
                alwaysOnTop: false,
                title: "Settings"
            },
            "settings");

        this.window.on("close", (event: Event) => {
            event.preventDefault();
            this.window.hide();
        });
    }
}