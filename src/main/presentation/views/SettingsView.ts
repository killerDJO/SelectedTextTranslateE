import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";

import { ViewNames } from "common/ViewNames";
import { ScalingState } from "common/dto/settings/ScalingState";
import { EditableSettings } from "common/dto/settings/editable-settings/EditableSettings";
import { Messages } from "common/messaging/Messages";
import { SettingsGroup } from "common/dto/settings/SettingsGroup";

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
    public readonly resetSettings$: Observable<void>;

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
        this.resetSettings$ = this.messageBus.observeCommand<void>(Messages.Settings.ResetSettings);
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

    public showSettingsGroup(settingsGroup: SettingsGroup): void {
        this.show();
        this.messageBus.sendValue<SettingsGroup>(Messages.Settings.SettingsGroup, settingsGroup);
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
                    inputText: settings.hotkeys.inputText,
                    toggleSuspend: settings.hotkeys.toggleSuspend
                },
                local: {
                    zoomIn: settings.renderer.hotkeys.zoomIn,
                    zoomOut: settings.renderer.hotkeys.zoomOut,
                    resetZoom: settings.renderer.hotkeys.resetZoom,
                    toggleDefinition: settings.views.translation.renderer.toggleDefinitionHotkey,
                    archiveResult: settings.views.translation.renderer.archiveResultHotkey,
                    toggleTags: settings.views.translation.renderer.toggleTagsHotkey,
                    addTag: settings.views.translation.renderer.addTagHotkey,
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
            },
            history: {
                numberOfRecordsPerPage: settings.views.history.renderer.pageSize,
                isContinuousSyncEnabled: settings.history.sync.isContinuousSyncEnabled,
                syncInterval: settings.history.sync.interval,
                backupOnApplicationStart: settings.history.sync.backupOnApplicationStart,
                backupOnApplicationStartNumberToKeep: settings.history.sync.backupOnApplicationStartNumberToKeep,
                backupRegularly: settings.history.sync.backupRegularly,
                backupRegularlyNumberToKeep: settings.history.sync.backupRegularlyNumberToKeep,
                backupRegularlyIntervalDays: settings.history.sync.backupRegularlyIntervalDays
            }
        };
    }

    private getSettings(settings: EditableSettings): DeepPartial<Settings> {
        return {
            hotkeys: {
                playText: settings.hotkeys.global.playText,
                translate: settings.hotkeys.global.translate,
                showDefinition: settings.hotkeys.global.showDefinition,
                inputText: settings.hotkeys.global.inputText,
                toggleSuspend: settings.hotkeys.global.toggleSuspend
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
            },
            history: {
                sync: {
                    interval: settings.history.syncInterval,
                    isContinuousSyncEnabled: settings.history.isContinuousSyncEnabled,
                    backupOnApplicationStart: settings.history.backupOnApplicationStart,
                    backupOnApplicationStartNumberToKeep: settings.history.backupOnApplicationStartNumberToKeep,
                    backupRegularly: settings.history.backupRegularly,
                    backupRegularlyNumberToKeep: settings.history.backupRegularlyNumberToKeep,
                    backupRegularlyIntervalDays: settings.history.backupRegularlyIntervalDays
                }
            },
            views: {
                history: {
                    renderer: {
                        pageSize: settings.history.numberOfRecordsPerPage
                    }
                },
                translation: {
                    renderer: {
                        toggleDefinitionHotkey: settings.hotkeys.local.toggleDefinition,
                        archiveResultHotkey: settings.hotkeys.local.archiveResult,
                        toggleTagsHotkey: settings.hotkeys.local.toggleTags,
                        addTagHotkey: settings.hotkeys.local.addTag
                    }
                }
            }
        };
    }
}