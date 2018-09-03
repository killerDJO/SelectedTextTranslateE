import { Module } from "vuex";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { TranslateResultCommand } from "common/dto/translation/TranslateResultCommand";
import { TranslationResultViewSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";
import { MessageBus } from "communication/MessageBus";
import { Messages } from "common/messaging/Messages";
import { RootState } from "root.store";

const messageBus = new MessageBus();

interface TranslationResultState {
    translateResult: TranslateResult | null;
    translationResultViewSettings?: TranslationResultViewSettings;
    isInitialized: boolean;
    isInProgress: boolean;
    showInput: boolean;
    defaultView: TranslateResultViews;
}

export const translationResult: Module<TranslationResultState, RootState> = {
    namespaced: true,
    state: {
        translateResult: null,
        translationResultViewSettings: undefined,
        isInitialized: false,
        isInProgress: false,
        showInput: false,
        defaultView: TranslateResultViews.Translation
    },
    mutations: {
        setTranslateResult(state: TranslationResultState, translateResultCommand: TranslateResultCommand): void {
            state.translateResult = translateResultCommand.translateResult;
            state.defaultView = translateResultCommand.defaultView;
            state.isInProgress = false;
            state.showInput = false;
        },
        setTranslationResultViewSettings(state: TranslationResultState, translationResultViewSettings: TranslationResultViewSettings): void {
            state.translationResultViewSettings = translationResultViewSettings;
        },
        setInitialized(state: TranslationResultState): void {
            state.isInitialized = true;
        },
        setInProgress(state: TranslationResultState): void {
            state.isInProgress = true;
            state.showInput = false;
        },
        setShowInput(state: TranslationResultState): void {
            state.showInput = true;
        }
    },
    actions: {
        fetchData({ commit }): void {
            messageBus.getValue<TranslateResultCommand>(Messages.Translation.TranslateResult, translateResult => commit("setTranslateResult", translateResult));
            messageBus.getValue<TranslationResultViewSettings>(Messages.Translation.TranslationResultViewSettings, translationResultViewSettings => {
                commit("setTranslationResultViewSettings", translationResultViewSettings);
                commit("setInitialized");
            });
            messageBus.getNotification(Messages.Translation.InProgressCommand, () => commit("setInProgress"));
            messageBus.getNotification(Messages.Translation.ShowInputCommand, () => commit("setShowInput"));
        },
        playText({ state }): void {
            executeCommand(state, Messages.Translation.PlayTextCommand, translateResult => translateResult.sentence.input);
        },
        translateSuggestion({ commit, state }): void {
            commit("setInProgress");
            executeCommand(state, Messages.Translation.TranslateCommand, translateResult => translateResult.sentence.suggestion);
        },
        forceTranslation({ commit, state }): void {
            commit("setInProgress");
            executeCommand(state, Messages.Translation.ForceTranslateCommand, translateResult => translateResult.sentence.input);
        },
        translateText({ commit }, text: string): void {
            commit("setInProgress");
            messageBus.sendCommand(Messages.Translation.TranslateCommand, text);
        }
    }
};

function executeCommand(state: TranslationResultState, commandName: Messages, inputGetter: (translateResult: TranslateResult) => string | null): void {
    if (state.translateResult === null) {
        return;
    }

    messageBus.sendCommand(commandName, inputGetter(state.translateResult));
}