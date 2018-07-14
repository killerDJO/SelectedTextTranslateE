import { Module } from "vuex";
import { MessageBus } from "communication/MessageBus";
import { Messages } from "common/messaging/Messages";
import { translationResult } from "components/translation-result/TranslationResult.store";
import { history } from "components/history/History.store";
import { RootState } from "root.store";

interface ApplicationState {
    accentColor?: string;
    scaleFactor: number;
    isFrameless: boolean;
}

const messageBus = new MessageBus();

export const app: Module<ApplicationState, RootState> = {
    namespaced: true,
    state: {
        accentColor: undefined,
        scaleFactor: 1,
        isFrameless: false
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
        }
    },
    actions: {
        fetchData({ commit }): void {
            messageBus.getValue<string>(Messages.AccentColor, accentColor => commit("setAccentColor", accentColor));
            messageBus.getValue<number>(Messages.ScaleFactor, scaleFactor => commit("setScaleFactor", scaleFactor));
            messageBus.getValue<string>(Messages.IsFramelessWindow, isFrameless => commit("setFramelessStatus", isFrameless));
        }
    },
    modules: {
        translationResult,
        history
    }
};