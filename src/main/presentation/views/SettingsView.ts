import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";

import { ViewNames } from "common/ViewNames";
import { ScalingState } from "common/dto/settings/ScalingState";
import { EditableSettings } from "common/dto/settings/editable-settings/EditableSettings";
import { Messages } from "common/messaging/Messages";

import { DeepPartial } from "utils/deep-partial";
import { mapSubject } from "utils/map-subject";

import { Settings } from "business-logic/settings/dto/Settings";

import { ViewBase } from "presentation/framework/ViewBase";
import { ViewContext } from "presentation/framework/ViewContext";

export class SettingsView extends ViewBase {

    public readonly pauseHotkeys$: Observable<boolean>;
    public readonly updatedSettings$: Observable<DeepPartial<Settings>>;
    public readonly setScaleFactor$: Observable<number>;
    public readonly setStartupState$: Observable<boolean>;
    public readonly openSettingsFile$: Observable<void>;

    constructor(viewContext: ViewContext) {
        super(ViewNames.Settings, viewContext, {
            iconName: "tray",
            isFrameless: false,
            title: "Settings",
            isScalingEnabled: mapSubject(viewContext.scalingSettings, scaling => !scaling.scaleTranslationViewOnly)
        });

        this.pauseHotkeys$ = this.messageBus.observeCommand<boolean>(Messages.Settings.PauseHotkeysRequest);
        this.updatedSettings$ = this.messageBus.observeCommand<EditableSettings>(Messages.Settings.EditableSettingsUpdated)
            .pipe(map(editableSettings => this.getSettings(editableSettings)));
        this.setScaleFactor$ = this.messageBus.observeCommand<number>(Messages.Settings.SetScaleFactorCommand);
        this.setStartupState$ = this.messageBus.observeCommand<boolean>(Messages.Settings.SetStartupStateCommand);
        this.openSettingsFile$ = this.messageBus.observeCommand<void>(Messages.Settings.OpenSettingsFile);
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

    public setStartupState(startupState$: Observable<boolean>): void {
        this.registerSubscription(
            this.messageBus.registerObservable(Messages.Settings.StartupState, startupState$).subscription);
    }

    private setSettingsInternal(name: string, settings$: Observable<Settings>): void {
        this.registerSubscription(
            this.messageBus.registerObservable(name, settings$.pipe(map(settings => this.getEditableSettings(settings)))).subscription);
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
            },
            play: {
                playVolume: settings.engine.playVolume
            },
            language: {
                sourceLanguage: settings.language.sourceLanguage,
                targetLanguage: settings.language.targetLanguage,
                allLanguages: this.context.settingsProvider.getLanguages()
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
            },
            engine: {
                playVolume: settings.play.playVolume
            },
            language: {
                sourceLanguage: settings.language.sourceLanguage,
                targetLanguage: settings.language.targetLanguage
            }
        };
    }
}