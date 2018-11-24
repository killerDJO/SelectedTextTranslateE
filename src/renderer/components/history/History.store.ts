import { Module, ActionContext } from "vuex";

import { RootState } from "root.store";
import { historySync } from "./history-sync/HistorySync.store";

import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { HistoryRecordsRequest } from "common/dto/history/HistoryRecordsRequest";
import { HistoryRecordsResponse } from "common/dto/history/HistoryRecordsResponse";
import { Messages } from "common/messaging/Messages";
import { SortOrder } from "common/dto/history/SortOrder";
import { SortColumn } from "common/dto/history/SortColumn";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { TranslateResultResponse } from "common/dto/translation/TranslateResultResponse";
import { ArchiveRequest } from "common/dto/history/ArchiveRequest";
import { AccountInfo } from "common/dto/history/account/AccountInfo";
import { HistoryViewRendererSettings, ColumnSettings } from "common/dto/settings/views-settings/HistoryViewSettings";

import { MessageBus } from "common/renderer/MessageBus";

import { TranslateResultState, translateResultMutations, translateResultActions } from "components/translation/translation-result/TranslationResult.store";
import { stat } from "fs";

const messageBus = new MessageBus();

interface HistoryState extends TranslateResultState {
    isInitialized: boolean;
    historyRecords: ReadonlyArray<HistoryRecord>;
    currentTags: ReadonlyArray<string>;
    currentUser: AccountInfo | null;
    columns: ReadonlyArray<ColumnSettings>;
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
    modules: {
        sync: historySync
    },
    state: {
        isInitialized: false,
        historyRecords: [],
        currentTags: [],
        currentUser: null,
        columns: [],
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
        setSettings(state: HistoryState, settings: HistoryViewRendererSettings): void {
            state.columns = settings.columns;
            state.pageSize = settings.pageSize;
            state.isInitialized = true;
        },
        setRecords(state: HistoryState, historyRecordsResponse: HistoryRecordsResponse): void {
            state.historyRecords = historyRecordsResponse.records;
            state.pageNumber = historyRecordsResponse.pageNumber;
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
        },
        setCurrentUser(state: HistoryState, currentUser: AccountInfo | null): void {
            state.currentUser = currentUser;
        },
        setCurrentTags(state: HistoryState, currentTags: ReadonlyArray<string>): void {
            state.currentTags = currentTags;
        }
    },
    actions: {
        ...translateResultActions,
        setup(context): void {
            translateResultActions.setup(context);

            const { commit, dispatch } = context;
            messageBus.observeValue<HistoryViewRendererSettings>(Messages.History.HistorySettings, settings => commit("setSettings", settings));
            messageBus.observeValue<HistoryRecordsResponse>(Messages.History.HistoryRecords, historyRecords => commit("setRecords", historyRecords));
            messageBus.observeValue<AccountInfo | null>(Messages.History.CurrentUser, currentUser => commit("setCurrentUser", currentUser));
            messageBus.observeValue<ReadonlyArray<string>>(Messages.History.CurrentTags, currentTags => commit("setCurrentTags", currentTags));
            messageBus.observeNotification(Messages.History.HistoryUpdated, () => dispatch("requestHistoryRecords"));
        },
        requestHistoryRecords({ state }): void {
            messageBus.sendCommand<HistoryRecordsRequest>(
                Messages.History.RequestHistoryRecords,
                {
                    pageNumber: state.pageNumber,
                    pageSize: state.pageSize,
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
        },
        playRecord(_, record: HistoryRecord): void {
            translateResultActions.playTextFromRequest(_, {
                text: record.sentence,
                language: record.sourceLanguage
            });
        },
        updateCurrentTags(_, tags: ReadonlyArray<string>) {
            messageBus.sendCommand<ReadonlyArray<string>>(Messages.History.UpdateCurrentTags, tags);
        },
        updateColumns(_, columns: ReadonlyArray<ColumnSettings>) {
            messageBus.sendCommand<ReadonlyArray<ColumnSettings>>(Messages.History.UpdateColumnSettings, columns);
        }
    }
};