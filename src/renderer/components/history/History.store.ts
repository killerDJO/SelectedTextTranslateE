import { Module } from "vuex";

import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { HistoryRecordsRequest } from "common/dto/history/HistoryRecordsRequest";
import { HistoryRecordsResponse } from "common/dto/history/HistoryRecordsResponse";
import { MessageBus } from "communication/MessageBus";
import { Messages } from "common/messaging/Messages";
import { RootState } from "root.store";
import { SortOrder } from "common/dto/history/SortOrder";
import { SortColumn } from "common/dto/history/SortColumn";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { TranslateResultResponse } from "common/dto/translation/TranslateResultResponse";
import { TranslateResultState, translateResultMutations, translateResultActions } from "components/translation/translation-result/TranslationResult.store";
import { ArchiveRequest } from "common/dto/history/ArchiveRequest";

const messageBus = new MessageBus();

interface HistoryState extends TranslateResultState {
    historyRecords: ReadonlyArray<HistoryRecord>;
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    sortColumn: SortColumn;
    sortOrder: SortOrder;
    starredOnly: boolean;
    includeArchived: boolean;

    isTranslationVisible: boolean;
}

export const history: Module<HistoryState, RootState> = {
    namespaced: true,
    state: {
        historyRecords: [],
        pageNumber: 1,
        pageSize: 0,
        totalRecords: 0,
        sortColumn: SortColumn.LastTranslatedDate,
        sortOrder: SortOrder.Desc,
        starredOnly: false,
        includeArchived: false,
        languages: new Map<string, string>(),

        translationHistoryRecord: null,
        translationResultViewSettings: null,
        isTranslationInProgress: false,
        defaultTranslateResultView: TranslateResultViews.Translation,
        isTranslationVisible: false,
        isOffline: false
    },
    mutations: {
        ...translateResultMutations,
        setRecords(state: HistoryState, historyRecordsResponse: HistoryRecordsResponse): void {
            state.historyRecords = historyRecordsResponse.records;
            state.pageNumber = historyRecordsResponse.pageNumber;
            state.pageSize = historyRecordsResponse.pageSize;
            state.totalRecords = historyRecordsResponse.totalRecords;
        },
        setPageNumber(state: HistoryState, pageNumber: number): void {
            state.pageNumber = pageNumber;
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
        setIncludeArchived(state: HistoryState, includeArchived: boolean): void {
            state.includeArchived = includeArchived;
        },
        setTranslationInProgress(state: HistoryState): void {
            translateResultMutations.setTranslationInProgress(state);
            state.isTranslationVisible = true;
        },
        setTranslateResult(state: HistoryState, translateResultCommand: TranslateResultResponse): void {
            translateResultMutations.setTranslateResult(state, translateResultCommand);
            state.isTranslationVisible = true;
        },
        hideTranslation(state: HistoryState): void {
            state.isTranslationVisible = false;
            state.translationHistoryRecord = null;
        }
    },
    actions: {
        ...translateResultActions,
        setup(context): void {
            translateResultActions.setup(context);

            const { commit, dispatch } = context;
            messageBus.getValue<HistoryRecordsResponse>(Messages.History.HistoryRecords, historyRecords => commit("setRecords", historyRecords));
            messageBus.getNotification(Messages.History.HistoryUpdated, () => dispatch("requestHistoryRecords"));
        },
        requestHistoryRecords({ state }): void {
            messageBus.sendCommand<HistoryRecordsRequest>(
                Messages.History.RequestHistoryRecords,
                {
                    pageNumber: state.pageNumber,
                    sortColumn: state.sortColumn,
                    sortOrder: state.sortOrder,
                    starredOnly: state.starredOnly,
                    includeArchived: state.includeArchived
                });
        },
        setArchivedStatus(_, request: { record: HistoryRecord; isArchived: boolean }): void {
            messageBus.sendCommand<ArchiveRequest>(
                Messages.History.ArchiveRecord,
                {
                    sentence: request.record.sentence,
                    isForcedTranslation: request.record.isForcedTranslation,
                    sourceLanguage: request.record.sourceLanguage,
                    targetLanguage: request.record.targetLanguage,
                    isArchived: request.isArchived
                });
        }
    }
};