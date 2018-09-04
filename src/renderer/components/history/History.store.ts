import { Module } from "vuex";

import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { HistoryRecordsRequest } from "common/dto/history/HistoryRecordsRequest";
import { MessageBus } from "communication/MessageBus";
import { Messages } from "common/messaging/Messages";
import { RootState } from "root.store";
import { SortOrder } from "common/dto/history/SortOrder";
import { SortColumn } from "common/dto/history/SortColumn";
import { TranslationResultViewSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { TranslateResult } from "common/dto/translation/TranslateResult";
import { TranslateResultCommand } from "common/dto/translation/TranslateResultCommand";
import { stat } from "fs";

const messageBus = new MessageBus();

interface HistoryState {
    historyRecords: HistoryRecord[];
    limit: number;
    sortColumn: SortColumn;
    sortOrder: SortOrder;

    translateResult?: TranslateResult;
    translationResultViewSettings?: TranslationResultViewSettings;
    defaultView: TranslateResultViews;
    isTranslationInProgress: boolean;
    isTranslationVisible: boolean;
}

export const history: Module<HistoryState, RootState> = {
    namespaced: true,
    state: {
        historyRecords: [],
        limit: 25,
        sortColumn: SortColumn.LastTranslatedDate,
        sortOrder: SortOrder.Desc,

        defaultView: TranslateResultViews.Translation,
        translationResultViewSettings: undefined,
        translateResult: undefined,
        isTranslationInProgress: false,
        isTranslationVisible: false
    },
    mutations: {
        setRecords(state: HistoryState, historyRecords: HistoryRecord[]): void {
            state.historyRecords = historyRecords;
        },
        setLimit(state: HistoryState, limit: number): void {
            state.limit = limit;
        },
        setSortColumn(state: HistoryState, sortColumn: SortColumn): void {
            state.sortColumn = sortColumn;
        },
        setSortOrder(state: HistoryState, sortOrder: SortOrder): void {
            state.sortOrder = sortOrder;
        },
        setTranslationResultViewSettings(state: HistoryState, translationResultViewSettings: TranslationResultViewSettings): void {
            state.translationResultViewSettings = translationResultViewSettings;
        },
        setTranslationInProgress(state: HistoryState): void {
            state.isTranslationInProgress = true;
            state.isTranslationVisible = true;
        },
        setTranslateResult(state: HistoryState, translateResultCommand: TranslateResultCommand): void {
            if (translateResultCommand.translateResult === null) {
                throw Error("Translation from history returned null");
            }

            state.translateResult = translateResultCommand.translateResult;
            state.isTranslationInProgress = false;
            state.isTranslationVisible = true;
        },
        hideTranslation(state: HistoryState): void {
            state.isTranslationVisible = false;
            state.translateResult = undefined;
        }
    },
    actions: {
        setup({ commit, dispatch }): void {
            messageBus.getValue<HistoryRecord[]>(Messages.History.HistoryRecords, historyRecords => commit("setRecords", historyRecords));
            messageBus.getNotification(Messages.History.HistoryUpdated, () => dispatch("requestHistoryRecords"));

            messageBus.getValue<TranslationResultViewSettings>(Messages.Translation.TranslationResultViewSettings, translationResultViewSettings => commit("setTranslationResultViewSettings", translationResultViewSettings));
            messageBus.getValue<TranslateResultCommand>(Messages.Translation.TranslateResult, translateResult => commit("setTranslateResult", translateResult));
            messageBus.getNotification(Messages.Translation.InProgressCommand, () => commit("setTranslationInProgress"));
        },
        requestHistoryRecords({ state }): void {
            messageBus.sendCommand<HistoryRecordsRequest>(Messages.History.RequestHistoryRecords, { limit: state.limit, sortColumn: state.sortColumn, sortOrder: state.sortOrder });
        },
        playText({ state }): void {
            executeTranslationCommand(state, Messages.Translation.PlayTextCommand, translateResult => translateResult.sentence.input);
        },
        translateSuggestion({ commit, state }): void {
            commit("setTranslationInProgress");
            executeTranslationCommand(state, Messages.Translation.TranslateCommand, translateResult => translateResult.sentence.suggestion);
        },
        forceTranslation({ commit, state }): void {
            commit("setTranslationInProgress");
            executeTranslationCommand(state, Messages.Translation.ForceTranslateCommand, translateResult => translateResult.sentence.input);
        },
        translateText({ commit }, text: string): void {
            commit("setTranslationInProgress");
            messageBus.sendCommand(Messages.Translation.TranslateCommand, text);
        }
    }
};

function executeTranslationCommand(state: HistoryState, commandName: Messages, inputGetter: (translateResult: TranslateResult) => string | null): void {
    if (!state.translateResult) {
        return;
    }

    messageBus.sendCommand(commandName, inputGetter(state.translateResult));
}