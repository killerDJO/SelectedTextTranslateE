import { Event, app, BrowserWindow } from "electron";
import { injectable, inject } from "inversify";

import { MessageBus } from "presentation/infrastructure/MessageBus";
import { ViewNames } from "common/ViewNames";
import { ViewBase } from "presentation/framework/ViewBase";
import { ViewContext } from "presentation/framework/ViewContext";

@injectable()
export class SettingsView extends ViewBase {
    constructor(viewContext: ViewContext) {
        super(ViewNames.Settings, viewContext);
    }

    protected scaleBounds(bounds: Electron.Rectangle): Electron.Rectangle {
        return this.getInitialBounds();
    }

    protected getInitialBounds(): Electron.Rectangle {
        return {
            x: 100,
            y: 100,
            width: this.context.scaler.scale(600),
            height: this.context.scaler.scale(300)
        };
    }
}