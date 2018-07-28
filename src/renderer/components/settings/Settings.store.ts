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
    scalingState: ScalingState | null;
}

export const settings: Module<SettingsState, RootState> = {
    namespaced: true,
    state: {
        settings: null,
        scalingState: null
    },
    mutations: {
        setSettings(state: SettingsState, editableSettings: EditableSettings): void {
            state.settings = editableSettings;
        },
        setScalingState(state: SettingsState, scalingState: ScalingState): void {
            state.scalingState = scalingState;
        }
    },
    actions: {
        setup({ commit }): void {
            messageBus.getValue<EditableSettings>(Messages.EditableSettings, editableSettings => commit("setSettings", editableSettings));
            messageBus.getValue<ScalingState>(Messages.ScalingState, scalingState => commit("setScalingState", scalingState));
        },
        updateSettings({ state }, editableSettings: EditableSettings): void {
            if (_.isEqual(state.settings, editableSettings)) {
                return;
            }
            messageBus.sendCommand<EditableSettings>(Messages.EditableSettingsUpdated, editableSettings);
        },
        pauseHotkeys(): void {
            messageBus.sendCommand<boolean>(Messages.PauseHotkeys, true);
        },
        enableHotkeys(): void {
            messageBus.sendCommand<boolean>(Messages.PauseHotkeys, false);
        },
        changeScaling(_, scaleFactor: number): void {
            messageBus.sendCommand<number>(Messages.SetScaleFactorCommand, scaleFactor);
        }
    }
};