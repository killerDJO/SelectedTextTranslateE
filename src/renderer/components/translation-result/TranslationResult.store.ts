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
}

export const translationResult: Module<TranslationResultState, RootState> = {
    namespaced: true,
    state: {
        translateResult: null,
        presentationSettings: undefined
    },
    mutations: {
        setTranslateResult(state: TranslationResultState, translateResult: TranslateResult | null): void {
            state.translateResult = translateResult;
        },
        setPresentationSettings(state: TranslationResultState, presentationSettings: PresentationSettings): void {
            state.presentationSettings = presentationSettings;
        }
    },
    actions: {
        fetchData({ commit }): void {
            messageBus.getValue<TranslateResult | null>(Messages.TranslateResult).subscribe(translateResult => commit("setTranslateResult", translateResult));
            messageBus.getValue<PresentationSettings>(Messages.PresentationSettings).subscribe(presentationSettings => commit("setPresentationSettings", presentationSettings));
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

function executeCommand(state: TranslationResultState, commandName: string, inputGetter: (translateResult: TranslateResult) => string | null): void {
    if (state.translateResult === null) {
        return;
    }

    messageBus.sendCommand(commandName, inputGetter(state.translateResult));
}