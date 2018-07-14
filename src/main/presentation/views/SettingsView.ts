import { ViewNames } from "common/ViewNames";
import { ViewBase } from "presentation/framework/ViewBase";
import { ViewContext } from "presentation/framework/ViewContext";

export class SettingsView extends ViewBase {
    constructor(viewContext: ViewContext) {
        super(ViewNames.Settings, viewContext, {
            iconName: "tray",
            isFrameless: false,
            title: "Settings"
        });
    }

    protected getInitialBounds(): Electron.Rectangle {
        const settingsViewSettings = this.context.settingsProvider.getSettings().view.settings;
        return this.getCentralPosition(settingsViewSettings.width, settingsViewSettings.height);
    }
}