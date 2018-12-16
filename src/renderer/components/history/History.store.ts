import { Module } from "vuex";
import * as _ from "lodash";

import { RootState } from "root.store";
import { historySync } from "./history-sync/HistorySync.store";
import { historyMerger } from "./history-merger/HistoryMerger.store";

import { HistoryRecordsRequest } from "common/dto/history/HistoryRecordsRequest";
import { HistoryRecordsResponse, HistoryRecordViewModel } from "common/dto/history/HistoryRecordsResponse";
import { Messages } from "common/messaging/Messages";
import { SortOrder } from "common/dto/history/SortOrder";
import { SortColumn } from "common/dto/history/SortColumn";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { TranslateResultResponse } from "common/dto/translation/TranslateResultResponse";
import { ArchiveRequest } from "common/dto/history/ArchiveRequest";
import { AccountInfo } from "common/dto/history/account/AccountInfo";
import { HistoryViewRendererSettings, ColumnSettings } from "common/dto/settings/views-settings/HistoryViewSettings";
import { HistoryFilter } from "common/dto/history/HistoryFilter";
import { TranslationKey } from "common/dto/translation/TranslationKey";

import { MessageBus } from "common/renderer/MessageBus";

import { TranslateResultState, translateResultMutations, translateResultActions } from "components/translation/translation-result/TranslationResult.store";

const messageBus = new MessageBus();
const throttledRefresh = _.throttle(requestHistoryRecords, 100, { trailing: true });

interface HistoryState extends TranslateResultState {
    areSettingsInitialized: boolean;
    areRecordsFetched: boolean;

    historyRecords: ReadonlyArray<HistoryRecordViewModel>;
    currentTags: ReadonlyArray<string>;
    currentUser: AccountInfo | null;
    columns: ReadonlyArray<ColumnSettings>;
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    sortColumn: SortColumn;
    sortOrder: SortOrder;
    filter: HistoryFilter;

    isTranslationVisible: boolean;
}

const emptyFilter = {
    starredOnly: false,
    includeArchived: false,
    input: undefined,
    maxLastTranslatedDate: undefined,
    maxTranslatedTime: undefined,
    minLastTranslatedDate: undefined,
    minTranslatedTime: undefined,
    sourceLanguage: undefined,
    targetLanguage: undefined,
    translation: undefined,
    tags: [],
    unsyncedOnly: false
};

export const history: Module<HistoryState, RootState> = {
    namespaced: true,
    modules: {
        sync: historySync,
        merger: historyMerger
    },
    state: {
        areSettingsInitialized: false,
        areRecordsFetched: false,
        historyRecords: [],
        currentTags: [],
        currentUser: null,
        columns: [],
        pageNumber: 1,
        pageSize: 0,
        totalRecords: 0,
        sortColumn: SortColumn.LastTranslatedDate,
        sortOrder: SortOrder.Desc,
        filter: {
            ...emptyFilter
        },
        languages: new Map<string, string>(),

        translationHistoryRecord: null,
        translationResultViewSettings: null,
        isTranslationInProgress: false,
        defaultTranslateResultView: TranslateResultViews.Translation,
        isTranslationVisible: false,
        isOffline: false
    },
    getters: {
        isInitialized: state => state.areRecordsFetched && state.areSettingsInitialized
    },
    mutations: {
        ...translateResultMutations,
        setSettings(state: HistoryState, settings: HistoryViewRendererSettings): void {
            state.columns = settings.columns;
            state.pageSize = settings.pageSize;
            state.areSettingsInitialized = true;
        },
        setRecords(state: HistoryState, historyRecordsResponse: HistoryRecordsResponse): void {
            state.historyRecords = historyRecordsResponse.records;
            state.pageNumber = historyRecordsResponse.pageNumber;
            state.totalRecords = historyRecordsResponse.totalRecords;
            state.areRecordsFetched = true;
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
        updateFilter(state: HistoryState, filter: Partial<HistoryFilter>): void {
            state.filter = { ...state.filter, ...filter };
        },
        clearFilter(state: HistoryState): void {
            state.filter = {
                ...emptyFilter,
                includeArchived: state.filter.includeArchived,
                starredOnly: state.filter.starredOnly
            };
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
            if (state.areSettingsInitialized) {
                throttledRefresh(state);
            }
        },
        setArchivedStatus(__, request: { record: TranslationKey; isArchived: boolean }): void {
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
        playRecord(context, record: TranslationKey): void {
            translateResultActions.playTextFromRequest(context, {
                text: record.sentence,
                language: record.sourceLanguage
            });
        },
        updateCurrentTags(__, tags: ReadonlyArray<string>) {
            messageBus.sendCommand<ReadonlyArray<string>>(Messages.History.UpdateCurrentTags, tags);
        },
        updateColumns(__, columns: ReadonlyArray<ColumnSettings>) {
            messageBus.sendCommand<ReadonlyArray<ColumnSettings>>(Messages.History.UpdateColumnSettings, columns);
        }
    }
};

function requestHistoryRecords(state: HistoryState): void {
    messageBus.sendCommand<HistoryRecordsRequest>(
        Messages.History.RequestHistoryRecords,
        {
            pageNumber: state.pageNumber,
            pageSize: state.pageSize,
            sortColumn: state.sortColumn,
            sortOrder: state.sortOrder,
            filter: state.filter
        });
}