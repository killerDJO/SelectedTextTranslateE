import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";

import { ViewNames } from "common/ViewNames";
import { ViewBase } from "presentation/framework/ViewBase";
import { ViewContext } from "presentation/framework/ViewContext";
import { Settings } from "business-logic/settings/dto/Settings";
import { EditableSettings } from "common/dto/settings/editable-settings/EditableSettings";
import { Messages } from "common/messaging/Messages";
import { DeepPartial } from "utils/deep-partial";
import { mapSubject } from "utils/map-subject";
import { ScalingState } from "common/dto/settings/ScalingState";

export class SettingsView extends ViewBase {

    public readonly pauseHotkeys$!: Observable<boolean>;
    public readonly updatedSettings$!: Observable<DeepPartial<Settings>>;
    public readonly setScaleFactor$!: Observable<number>;
    public readonly openSettingsFile$!: Observable<void>;

    constructor(viewContext: ViewContext) {
        super(ViewNames.Settings, viewContext, {
            iconName: "tray",
            isFrameless: false,
            title: "Settings",
            isScalingEnabled: mapSubject(viewContext.scalingSettings, scaling => !scaling.scaleTranslationViewOnly)
        });

        this.pauseHotkeys$ = this.messageBus.getValue<boolean>(Messages.Settings.PauseHotkeysRequest);
        this.updatedSettings$ = this.messageBus.getValue<EditableSettings>(Messages.Settings.EditableSettingsUpdated)
            .pipe(map(editableSettings => this.getSettings(editableSettings)));
        this.setScaleFactor$ = this.messageBus.getValue<number>(Messages.Settings.SetScaleFactorCommand);
        this.openSettingsFile$ = this.messageBus.getValue<void>(Messages.Settings.OpenSettingsFile);
    }

    public setSettings(settings$: Observable<Settings>): void {
        this.setSettingsInternal(Messages.Settings.EditableSettings, settings$);
    }

    public setDefaultSettings(defaultSettings$: Settings): void {
        this.setSettingsInternal(Messages.Settings.DefaultEditableSettings, of(defaultSettings$));
    }

    public setScalingState(scalingState$: Observable<ScalingState>): void {
        this.registerSubscription(
            this.messageBus.registerObservable(Messages.Settings.ScalingState, scalingState$).subscription);
    }

    private setSettingsInternal(name: string, settings$: Observable<Settings>): void {
        this.registerSubscription(
            this.messageBus.registerObservable(name, settings$.pipe(map(this.getEditableSettings))).subscription);
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
                    showDefinition: settings.hotkeys.showDefinition,
                    inputText: settings.hotkeys.inputText
                },
                local: {
                    zoomIn: settings.renderer.hotkeys.zoomIn,
                    zoomOut: settings.renderer.hotkeys.zoomOut,
                    resetZoom: settings.renderer.hotkeys.resetZoom
                }
            },
            scaling: {
                scaleTranslationViewOnly: settings.scaling.scaleTranslationViewOnly
            }
        };
    }

    private getSettings(settings: EditableSettings): DeepPartial<Settings> {
        return {
            hotkeys: {
                playText: settings.hotkeys.global.playText,
                translate: settings.hotkeys.global.translate,
                showDefinition: settings.hotkeys.global.showDefinition,
                inputText: settings.hotkeys.global.inputText
            },
            renderer: {
                hotkeys: {
                    zoomIn: settings.hotkeys.local.zoomIn,
                    zoomOut: settings.hotkeys.local.zoomOut,
                    resetZoom: settings.hotkeys.local.resetZoom
                }
            },
            scaling: {
                scaleTranslationViewOnly: settings.scaling.scaleTranslationViewOnly
            }
        };
    }
}