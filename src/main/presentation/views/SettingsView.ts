import { ViewNames } from "common/ViewNames";
import { ViewBase } from "presentation/framework/ViewBase";
import { ViewContext } from "presentation/framework/ViewContext";
import { Settings } from "business-logic/settings/dto/Settings";
import { EditableSettings } from "common/dto/editable-settings/EditableSettings";
import { Messages } from "common/messaging/Messages";

export class SettingsView extends ViewBase {
    constructor(viewContext: ViewContext) {
        super(ViewNames.Settings, viewContext, {
            iconName: "tray",
            isFrameless: false,
            title: "Settings"
        });
    }

    public setSettings(settings: Settings): void {
        this.messageBus.sendValue(Messages.EditableSettings, this.getEditableSettings(settings));
    }

    protected getInitialBounds(): Electron.Rectangle {
        const settingsViewSettings = this.context.viewSettings.settings;
        return this.getCentralPosition(settingsViewSettings.width, settingsViewSettings.height);
    }

    private getEditableSettings(settings: Settings): EditableSettings {
        return {
            hotkeys: settings.hotkeys,
            scaling: settings.view.scaling
        }
    }
}