import { Module } from "vuex";

import { RootState } from "root.store";

import { MessageBus } from "common/renderer/MessageBus";
import { Messages } from "common/messaging/Messages";
import { translation } from "components/translation/Translation.store";
import { history } from "components/history/History.store";
import { settings } from "components/settings/Settings.store";
import { about } from "components/about/About.store";

import { HotkeySettings, RendererSettings } from "common/dto/settings/renderer-settings/RendererSettings";

interface ApplicationState {
    accentColor?: string;
    scaleFactor: number;
    isFrameless: boolean;
    hotkeySettings?: HotkeySettings;
}

const messageBus = new MessageBus();

export const app: Module<ApplicationState, RootState> = {
    namespaced: true,
    state: {
        accentColor: undefined,
        scaleFactor: 1,
        isFrameless: false,
        hotkeySettings: undefined,
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
        setHotkeySettings(state: ApplicationState, hotkeySettings: HotkeySettings): void {
            state.hotkeySettings = hotkeySettings;
        },
    },
    actions: {
        setup({ commit }): void {
            messageBus.observeValue<string>(Messages.Common.AccentColor, accentColor => commit("setAccentColor", accentColor));
            messageBus.observeValue<number>(Messages.Common.ScaleFactor, scaleFactor => commit("setScaleFactor", scaleFactor));
            messageBus.observeValue<string>(Messages.Common.IsFramelessWindow, isFrameless => commit("setFramelessStatus", isFrameless));
            messageBus.observeValue<RendererSettings>(Messages.Common.RendererSettings, rendererSettings => commit("setHotkeySettings", rendererSettings.hotkeys));
        },
        zoomIn(): void {
            messageBus.sendCommand(Messages.Common.ZoomInCommand);
        },
        zoomOut(): void {
            messageBus.sendCommand(Messages.Common.ZoomOutCommand);
        },
        resetZoom(): void {
            messageBus.sendCommand(Messages.Common.ResetZoomCommand);
        }
    },
    modules: {
        translation,
        history,
        settings,
        about
    }
};