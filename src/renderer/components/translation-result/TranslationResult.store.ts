import { Module } from "vuex";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { PresentationSettings } from "common/dto/presentation-settings/PresentationSettings";
import { MessageBus } from "framework/MessageBus";
import { Messages } from "common/messaging/Messages";
import { RootState } from "store";

const messageBus = new MessageBus();

interface TranslationResultState {
    translateResult: TranslateResult | null;
    presentationSettings?: PresentationSettings;
    isInitialized: boolean;
}

export const translationResult: Module<TranslationResultState, RootState> = {
    namespaced: true,
    state: {
        translateResult: null,
        presentationSettings: undefined,
        isInitialized: false
    },
    mutations: {
        setTranslateResult(state: TranslationResultState, translateResult: TranslateResult | null): void {
            state.translateResult = translateResult;
        },
        setPresentationSettings(state: TranslationResultState, presentationSettings: PresentationSettings): void {
            state.presentationSettings = presentationSettings;
        },
        setInitialized(state: TranslationResultState): void {
            state.isInitialized = true;
        }
    },
    actions: {
        fetchData({ commit }): void {
            messageBus.getValue<TranslateResult | null>(Messages.TranslateResult).subscribe(translateResult => commit("setTranslateResult", translateResult));
            messageBus.getValue<PresentationSettings>(Messages.PresentationSettings).subscribe(presentationSettings => {
                commit("setPresentationSettings", presentationSettings);
                commit("setInitialized");
            });
        },
        playText({ state }): void {
            executeCommand(state, Messages.PlayTextCommand, translateResult => translateResult.sentence.input);
        },
        translateSuggestion({ state }): void {
            executeCommand(state, Messages.TranslateCommand, translateResult => translateResult.sentence.suggestion);
        },
        forceTranslation({ state }): void {
            executeCommand(state, Messages.ForceTranslateCommand, translateResult => translateResult.sentence.input);
        },
    }
};

function executeCommand(state: TranslationResultState, commandName: Messages, inputGetter: (translateResult: TranslateResult) => string | null): void {
    if (state.translateResult === null) {
        return;
    }

    messageBus.sendCommand(commandName, inputGetter(state.translateResult));
}