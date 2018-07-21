import { Module } from "vuex";
import { MessageBus } from "communication/MessageBus";
import { Messages } from "common/messaging/Messages";
import { translationResult } from "components/translation-result/TranslationResult.store";
import { history } from "components/history/History.store";
import { settings } from "components/settings/Settings.store"
import { RootState } from "root.store";

import { PresentationHotkeySettings, PresentationSettings } from "common/dto/settings/presentation-settings/PresentationSettings";

interface ApplicationState {
    accentColor?: string;
    scaleFactor: number;
    isFrameless: boolean;
    hotkeySettings?: PresentationHotkeySettings;
    areHotkeysPaused: boolean;
}

const messageBus = new MessageBus();

export const app: Module<ApplicationState, RootState> = {
    namespaced: true,
    state: {
        accentColor: undefined,
        scaleFactor: 1,
        isFrameless: false,
        hotkeySettings: undefined,
        areHotkeysPaused: false
    },
    mutations: {
        setAccentColor(state: ApplicationState, accentColor: string): void {
            state.accentColor = accentColor;
        },
        setScaleFactor(state: ApplicationState, scaleFactor: number): void {
            state.scaleFactor = scaleFactor;
        },
        setFramelessStatus(state: ApplicationState, isFrameless: boolean): void {
            state.isFrameless = isFrameless;
        },
        setHotkeySettings(state: ApplicationState, hotkeySettings: PresentationHotkeySettings): void {
            state.hotkeySettings = hotkeySettings;
        },
        setHotkeyPausedState(state: ApplicationState, areHotkeysPaused: boolean): void {
            state.areHotkeysPaused = areHotkeysPaused;
        }
    },
    actions: {
        fetchData({ commit }): void {
            messageBus.getValue<string>(Messages.AccentColor, accentColor => commit("setAccentColor", accentColor));
            messageBus.getValue<number>(Messages.ScaleFactor, scaleFactor => commit("setScaleFactor", scaleFactor));
            messageBus.getValue<string>(Messages.IsFramelessWindow, isFrameless => commit("setFramelessStatus", isFrameless));
            messageBus.getValue<PresentationSettings>(Messages.PresentationSettings, settings => commit("setHotkeySettings", settings.hotkeys));
            messageBus.getValue<boolean>(Messages.PauseHotkeys, areHotkeysPaused => commit("setHotkeyPausedState", areHotkeysPaused));
        },
        zoomIn(): void {
            messageBus.sendCommand(Messages.ZoomInCommand);
        },
        zoomOut(): void {
            messageBus.sendCommand(Messages.ZoomOutCommand);
        }
    },
    modules: {
        translationResult,
        history,
        settings
    }
};