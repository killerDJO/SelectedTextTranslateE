import { Module } from "vuex";
import * as _ from "lodash";

import { MessageBus } from "communication/MessageBus";
import { Messages } from "common/messaging/Messages";
import { RootState } from "root.store";
import { EditableSettings } from "common/dto/settings/editable-settings/EditableSettings";
import { ScalingState } from "common/dto/settings/ScalingState";

const messageBus = new MessageBus();

interface SettingsState {
    settings: EditableSettings | null;
    defaultSettings: EditableSettings | null;
    scalingState: ScalingState | null;
    isStartupEnabled: boolean;
}

export const settings: Module<SettingsState, RootState> = {
    namespaced: true,
    state: {
        settings: null,
        scalingState: null,
        isStartupEnabled: false,
        defaultSettings: null
    },
    mutations: {
        setSettings(state: SettingsState, editableSettings: EditableSettings): void {
            state.settings = editableSettings;
        },
        setDefaultSettings(state: SettingsState, defaultSettings: EditableSettings): void {
            state.defaultSettings = defaultSettings;
        },
        setScalingState(state: SettingsState, scalingState: ScalingState): void {
            state.scalingState = scalingState;
        },
        setStartupState(state: SettingsState, isStartupEnabled: boolean): void {
            state.isStartupEnabled = isStartupEnabled;
        }
    },
    actions: {
        setup({ commit }): void {
            messageBus.getValue<EditableSettings>(Messages.Settings.EditableSettings, editableSettings => commit("setSettings", editableSettings));
            messageBus.getValue<EditableSettings>(Messages.Settings.DefaultEditableSettings, defaultSettings => commit("setDefaultSettings", defaultSettings));
            messageBus.getValue<ScalingState>(Messages.Settings.ScalingState, scalingState => commit("setScalingState", scalingState));
            messageBus.getValue<boolean>(Messages.Settings.StartupState, isStartupEnabled => commit("setStartupState", isStartupEnabled));
        },
        updateSettings({ state }, editableSettings: EditableSettings): void {
            if (_.isEqual(state.settings, editableSettings)) {
                return;
            }
            messageBus.sendCommand<EditableSettings>(Messages.Settings.EditableSettingsUpdated, editableSettings);
        },
        pauseHotkeys(): void {
            messageBus.sendCommand<boolean>(Messages.Settings.PauseHotkeysRequest, true);
        },
        enableHotkeys(): void {
            messageBus.sendCommand<boolean>(Messages.Settings.PauseHotkeysRequest, false);
        },
        changeScaling(__, scaleFactor: number): void {
            messageBus.sendCommand<number>(Messages.Settings.SetScaleFactorCommand, scaleFactor);
        },
        openSettingsFile(): void {
            messageBus.sendCommand<void>(Messages.Settings.OpenSettingsFile);
        },
        setStartupState(__, isStartupEnabled: boolean): void {
            messageBus.sendCommand<boolean>(Messages.Settings.SetStartupStateCommand, isStartupEnabled);
        }
    }
};