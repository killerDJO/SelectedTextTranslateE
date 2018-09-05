import { Module } from "vuex";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { TranslateResultCommand } from "common/dto/translation/TranslateResultCommand";
import { TranslationResultViewSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";
import { MessageBus } from "communication/MessageBus";
import { Messages } from "common/messaging/Messages";
import { RootState } from "root.store";
import { remote } from "electron";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { StarCommand } from "common/dto/translation/StarCommand";

const messageBus = new MessageBus();

interface TranslationState {
    historyRecord: HistoryRecord | null;
    translationResultViewSettings?: TranslationResultViewSettings;
    isInitialized: boolean;
    isInProgress: boolean;
    showInput: boolean;
    defaultView: TranslateResultViews;
}

export const translation: Module<TranslationState, RootState> = {
    namespaced: true,
    state: {
        historyRecord: null,
        translationResultViewSettings: undefined,
        isInitialized: false,
        isInProgress: false,
        showInput: false,
        defaultView: TranslateResultViews.Translation
    },
    mutations: {
        setTranslateResult(state: TranslationState, translateResultCommand: TranslateResultCommand): void {
            state.historyRecord = translateResultCommand.historyRecord;
            if (translateResultCommand.defaultView) {
                state.defaultView = translateResultCommand.defaultView;
            }
            state.isInProgress = false;
            state.showInput = false;
        },
        clearTranslateResult(state: TranslationState): void {
            state.historyRecord = null;
            state.isInProgress = false;
            state.showInput = false;
        },
        setTranslationResultViewSettings(state: TranslationState, translationResultViewSettings: TranslationResultViewSettings): void {
            state.translationResultViewSettings = translationResultViewSettings;
        },
        setInitialized(state: TranslationState): void {
            state.isInitialized = true;
        },
        setInProgress(state: TranslationState): void {
            state.isInProgress = true;
            state.showInput = false;
        },
        setShowInput(state: TranslationState): void {
            state.showInput = true;
        }
    },
    actions: {
        fetchData({ commit }): void {
            messageBus.getNotification(Messages.Translation.InProgressCommand, () => commit("setInProgress"));
            messageBus.getValue<TranslateResultCommand>(Messages.Translation.TranslateResult, translateResult => commit("setTranslateResult", translateResult));
            messageBus.getValue<TranslationResultViewSettings>(Messages.Translation.TranslationResultViewSettings, translationResultViewSettings => {
                commit("setTranslationResultViewSettings", translationResultViewSettings);
                commit("setInitialized");
            });
            messageBus.getNotification(Messages.Translation.ShowInputCommand, () => commit("setShowInput"));

            remote.getCurrentWindow().on("hide", () => commit("clearTranslateResult"));
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
        },
        setStarredStatus(_, request: { record: HistoryRecord; isStarred: boolean }): void {
            messageBus.sendCommand<StarCommand>(Messages.Translation.StarTranslateResult, { sentence: request.record.sentence, isForcedTranslation: request.record.isForcedTranslation, isStarred: request.isStarred });
        }
    }
};

function executeCommand(state: TranslationState, commandName: Messages, inputGetter: (translateResult: TranslateResult) => string | null): void {
    if (state.historyRecord === null) {
        return;
    }

    messageBus.sendCommand(commandName, inputGetter(state.historyRecord.translateResult));
}