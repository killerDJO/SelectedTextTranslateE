import { Module } from "vuex";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { TranslationResultViewSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";
import { MessageBus } from "communication/MessageBus";
import { Messages } from "common/messaging/Messages";
import { RootState } from "root.store";

const messageBus = new MessageBus();

interface TranslationResultState {
    translateResult: TranslateResult | null;
    translationResultViewSettings?: TranslationResultViewSettings;
    isInitialized: boolean;
}

export const translationResult: Module<TranslationResultState, RootState> = {
    namespaced: true,
    state: {
        translateResult: null,
        translationResultViewSettings: undefined,
        isInitialized: false
    },
    mutations: {
        setTranslateResult(state: TranslationResultState, translateResult: TranslateResult | null): void {
            state.translateResult = translateResult;
        },
        setTranslationResultViewSettings(state: TranslationResultState, translationResultViewSettings: TranslationResultViewSettings): void {
            state.translationResultViewSettings = translationResultViewSettings;
        },
        setInitialized(state: TranslationResultState): void {
            state.isInitialized = true;
        }
    },
    actions: {
        fetchData({ commit }): void {
            messageBus.getValue<TranslateResult | null>(Messages.Translation.TranslateResult, translateResult => commit("setTranslateResult", translateResult));
            messageBus.getValue<TranslationResultViewSettings>(Messages.Translation.TranslationResultViewSettings, translationResultViewSettings => {
                commit("setTranslationResultViewSettings", translationResultViewSettings);
                commit("setInitialized");
            });
        },
        playText({ state }): void {
            executeCommand(state, Messages.Translation.PlayTextCommand, translateResult => translateResult.sentence.input);
        },
        translateSuggestion({ state }): void {
            executeCommand(state, Messages.Translation.TranslateCommand, translateResult => translateResult.sentence.suggestion);
        },
        forceTranslation({ state }): void {
            executeCommand(state, Messages.Translation.ForceTranslateCommand, translateResult => translateResult.sentence.input);
        },
    }
};

function executeCommand(state: TranslationResultState, commandName: Messages, inputGetter: (translateResult: TranslateResult) => string | null): void {
    if (state.translateResult === null) {
        return;
    }

    messageBus.sendCommand(commandName, inputGetter(state.translateResult));
}