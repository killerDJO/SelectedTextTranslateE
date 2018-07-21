import { Observable } from "rxjs";

import { ViewNames } from "common/ViewNames";
import { ViewBase } from "presentation/framework/ViewBase";
import { ViewContext } from "presentation/framework/ViewContext";
import { Settings } from "business-logic/settings/dto/Settings";
import { EditableSettings } from "common/dto/settings/editable-settings/EditableSettings";
import { Messages } from "common/messaging/Messages";

export class SettingsView extends ViewBase {

    public readonly pauseHotkeys$!: Observable<boolean>;

    constructor(viewContext: ViewContext) {
        super(ViewNames.Settings, viewContext, {
            iconName: "tray",
            isFrameless: false,
            title: "Settings"
        });

        this.pauseHotkeys$ = this.messageBus.getValue<boolean>(Messages.PauseHotkeys);
        this.messageBus.registerObservable(Messages.PauseHotkeys, this.pauseHotkeys$);
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
            hotkeys: {
                playText: settings.hotkeys.playText,
                translate: settings.hotkeys.translate,
                zoomIn: settings.presentation.hotkeys.zoomIn,
                zoomOut: settings.presentation.hotkeys.zoomOut
            },
            scaling: settings.view.scaling
        }
    }
}