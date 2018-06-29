import { StoreOptions, Module } from "vuex";
import { MessageBus } from "framework/MessageBus";
import { Messages } from "common/messaging/Messages";
import { translationResult } from "components/translation-result/TranslationResult.store";
import { RootState } from "store";

interface ApplicationState {
    accentColor?: string;
    scaleFactor: number;
}

const messageBus = new MessageBus();

export const app: Module<ApplicationState, RootState> = {
    namespaced: true,
    state: {
        accentColor: undefined,
        scaleFactor: 1
    },
    mutations: {
        setAccentColor(state: ApplicationState, accentColor: string): void {
            state.accentColor = accentColor;
        },
        setScaleFactor(state: ApplicationState, scaleFactor: number): void {
            state.scaleFactor = scaleFactor;
        }
    },
    actions: {
        fetchData({ commit }): void {
            messageBus.getValue<string>(Messages.AccentColor).subscribe(accentColor => commit("setAccentColor", accentColor));
            messageBus.getValue<number>(Messages.ScaleFactor).subscribe(scaleFactor => commit("setScaleFactor", scaleFactor));
        }
    },
    modules: {
        translationResult
    }
};