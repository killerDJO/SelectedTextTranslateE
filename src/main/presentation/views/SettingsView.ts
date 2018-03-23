import { Event, app, BrowserWindow } from "electron";
import { injectable, inject } from "inversify";

import { PresentationSettings } from "presentation/settings/PresentationSettings";
import { MessageBus } from "presentation/infrastructure/MessageBus";
import { Scaler } from "presentation/infrastructure/Scaler";
import { ViewBase } from "./ViewBase";
import { HotkeysRegistry } from "presentation/hotkeys/HotkeysRegistry";
import { ViewNames } from "common/ViewNames";

@injectable()
export class SettingsView extends ViewBase {
    constructor(
        presentationSettings: PresentationSettings,
        scaler: Scaler,
        hotkeysRegistry: HotkeysRegistry) {
        super(ViewNames.Settings, presentationSettings, scaler, hotkeysRegistry);
    }

    protected scaleBounds(bounds: Electron.Rectangle): Electron.Rectangle {
        return this.getInitialBounds();
    }

    protected getInitialBounds(): Electron.Rectangle {
        return {
            x: 100,
            y: 100,
            width: this.scaler.scale(600),
            height: this.scaler.scale(300)
        };
    }
}