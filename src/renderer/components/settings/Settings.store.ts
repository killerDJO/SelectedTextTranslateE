import { Module } from "vuex";

import { MessageBus } from "communication/MessageBus";
import { Messages } from "common/messaging/Messages";
import { RootState } from "root.store";
import { EditableSettings } from "common/dto/editable-settings/EditableSettings";

const messageBus = new MessageBus();

interface SettingsState {
    settings: EditableSettings | null;
}

export const settings: Module<SettingsState, RootState> = {
    namespaced: true,
    state: {
        settings: null,
    },
    mutations: {
        setSettings(state: SettingsState, editableSettings: EditableSettings): void {
            state.settings = editableSettings;
        }
    },
    actions: {
        setup({ commit }): void {
            messageBus.getValue<EditableSettings>(Messages.EditableSettings, editableSettings => commit("setSettings", editableSettings));
        }
    }
};