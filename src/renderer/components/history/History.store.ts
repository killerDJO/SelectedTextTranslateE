import { Module } from "vuex";

import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { HistoryRecordsRequest } from "common/dto/history/HistoryRecordsRequest";
import { MessageBus } from "communication/MessageBus";
import { Messages } from "common/messaging/Messages";
import { RootState } from "root.store";
import { SortOrder } from "common/dto/history/SortOrder";
import { SortColumn } from "common/dto/history/SortColumn";
import { StarCommand } from "common/dto/translation/StarCommand";
import { TranslationResultViewSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { TranslateResult } from "common/dto/translation/TranslateResult";
import { TranslateResultCommand } from "common/dto/translation/TranslateResultCommand";

const messageBus = new MessageBus();

interface HistoryState {
    historyRecords: HistoryRecord[];
    limit: number;
    sortColumn: SortColumn;
    sortOrder: SortOrder;

    translateResultHistoryRecord: HistoryRecord | null;
    translationResultViewSettings?: TranslationResultViewSettings;
    defaultView: TranslateResultViews;
    isTranslationInProgress: boolean;
    isTranslationVisible: boolean;
    starredOnly: boolean;
}

export const history: Module<HistoryState, RootState> = {
    namespaced: true,
    state: {
        historyRecords: [],
        limit: 25,
        sortColumn: SortColumn.LastTranslatedDate,
        sortOrder: SortOrder.Desc,
        starredOnly: false,

        defaultView: TranslateResultViews.Translation,
        translationResultViewSettings: undefined,
        translateResultHistoryRecord: null,
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
        setStarredOnly(state: HistoryState, starredOnly: boolean): void {
            state.starredOnly = starredOnly;
        },
        setTranslationResultViewSettings(state: HistoryState, translationResultViewSettings: TranslationResultViewSettings): void {
            state.translationResultViewSettings = translationResultViewSettings;
        },
        setTranslationInProgress(state: HistoryState): void {
            state.isTranslationInProgress = true;
            state.isTranslationVisible = true;
        },
        setTranslateResult(state: HistoryState, translateResultCommand: TranslateResultCommand): void {
            if (translateResultCommand.historyRecord === null) {
                throw Error("Translation from history returned null");
            }

            state.translateResultHistoryRecord = translateResultCommand.historyRecord;
            if (translateResultCommand.defaultView) {
                state.defaultView = translateResultCommand.defaultView;
            }
            state.isTranslationInProgress = false;
            state.isTranslationVisible = true;
        },
        hideTranslation(state: HistoryState): void {
            state.isTranslationVisible = false;
            state.translateResultHistoryRecord = null;
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
            messageBus.sendCommand<HistoryRecordsRequest>(Messages.History.RequestHistoryRecords, { limit: state.limit, sortColumn: state.sortColumn, sortOrder: state.sortOrder, starredOnly: state.starredOnly });
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
        },
        setStarredStatus(_, request: { record: HistoryRecord; isStarred: boolean }): void {
            messageBus.sendCommand<StarCommand>(Messages.Translation.StarTranslateResult, { sentence: request.record.sentence, isForcedTranslation: request.record.isForcedTranslation, isStarred: request.isStarred });
        }
    }
};

function executeTranslationCommand(state: HistoryState, commandName: Messages, inputGetter: (translateResult: TranslateResult) => string | null): void {
    if (!state.translateResultHistoryRecord) {
        return;
    }

    messageBus.sendCommand(commandName, inputGetter(state.translateResultHistoryRecord.translateResult));
}