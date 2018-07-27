import { Observable } from "rxjs";

import { ViewNames } from "common/ViewNames";
import { ViewBase } from "presentation/framework/ViewBase";
import { ViewContext } from "presentation/framework/ViewContext";
import { Settings } from "business-logic/settings/dto/Settings";
import { EditableSettings } from "common/dto/settings/editable-settings/EditableSettings";
import { Messages } from "common/messaging/Messages";
import { DeepPartial } from "utils/deep-partial";

export class SettingsView extends ViewBase {

    public readonly pauseHotkeys$!: Observable<boolean>;
    public readonly updatedSettings$!: Observable<DeepPartial<Settings>>;

    constructor(viewContext: ViewContext) {
        super(ViewNames.Settings, viewContext, {
            iconName: "tray",
            isFrameless: false,
            title: "Settings",
            isScalingEnabled: !viewContext.scalingSettings.scaleTranslationViewOnly
        });

        this.pauseHotkeys$ = this.messageBus.getValue<boolean>(Messages.PauseHotkeys);
        this.messageBus.registerObservable(Messages.PauseHotkeys, this.pauseHotkeys$);
        this.updatedSettings$ = this.messageBus.getValue<EditableSettings>(Messages.EditableSettingsUpdated).map(editableSettings => this.getSettings(editableSettings));
    }

    public setSettings(settings$: Observable<Settings>): void {
        this.registerSubscription(
            this.messageBus.registerObservable(Messages.EditableSettings, settings$.map(this.getEditableSettings)));
    }

    protected getInitialBounds(): Electron.Rectangle {
        const settingsViewSettings = this.context.viewsSettings.settings;
        return this.getCentralPosition(settingsViewSettings.width, settingsViewSettings.height);
    }

    private getEditableSettings(settings: Settings): EditableSettings {
        return {
            hotkeys: {
                global: {
                    playText: settings.hotkeys.playText,
                    translate: settings.hotkeys.translate,
                },
                local: {
                    zoomIn: settings.renderer.hotkeys.zoomIn,
                    zoomOut: settings.renderer.hotkeys.zoomOut
                }
            },
            scaling: settings.scaling
        };
    }

    private getSettings(settings: EditableSettings): DeepPartial<Settings> {
        return {
            hotkeys: {
                playText: settings.hotkeys.global.playText,
                translate: settings.hotkeys.global.translate
            },
            renderer: {
                hotkeys: {
                    zoomIn: settings.hotkeys.local.zoomIn,
                    zoomOut: settings.hotkeys.local.zoomOut
                }
            },
            scaling: settings.scaling
        };
    }
}