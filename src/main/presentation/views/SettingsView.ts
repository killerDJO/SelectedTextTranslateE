import { Event, app, BrowserWindow, screen } from "electron";
import { injectable } from "inversify";

import { MessageBus } from "presentation/infrastructure/MessageBus";
import { ViewNames } from "common/ViewNames";
import { ViewBase } from "presentation/framework/ViewBase";
import { ViewContext } from "presentation/framework/ViewContext";

@injectable()
export class SettingsView extends ViewBase {
    constructor(viewContext: ViewContext) {
        super(ViewNames.Settings, viewContext, {
            iconName: "tray",
            isFrameless: false,
            title: "Settings"
        });
    }

    protected getInitialBounds(): Electron.Rectangle {
        return this.getCentralPosition(600, 300);
    }
}