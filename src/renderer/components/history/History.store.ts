import { Module } from "vuex";

import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { HistoryRecordsRequest } from "common/dto/history/HistoryRecordsRequest";
import { MessageBus } from "communication/MessageBus";
import { Messages } from "common/messaging/Messages";
import { RootState } from "root.store";
import { SortOrder } from "common/dto/history/SortOrder";
import { SortColumn } from "common/dto/history/SortColumn";

const messageBus = new MessageBus();

interface HistoryState {
    historyRecords: HistoryRecord[];
    limit: number;
    sortColumn: SortColumn;
    sortOrder: SortOrder;
}

export const history: Module<HistoryState, RootState> = {
    namespaced: true,
    state: {
        historyRecords: [],
        limit: 25,
        sortColumn: SortColumn.LastTranslatedDate,
        sortOrder: SortOrder.Desc,
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
        }
    },
    actions: {
        setup({ commit, dispatch }): void {
            messageBus.getValue<HistoryRecord[]>(Messages.History.HistoryRecords, historyRecords => commit("setRecords", historyRecords));
            messageBus.getNotification(Messages.History.HistoryUpdated, () => dispatch("requestHistoryRecords"));
        },
        requestHistoryRecords({ state }): void {
            messageBus.sendCommand<HistoryRecordsRequest>(Messages.History.RequestHistoryRecords, { limit: state.limit, sortColumn: state.sortColumn, sortOrder: state.sortOrder });
        },
        translateWord(_, word: string): void {
            messageBus.sendCommand<string>(Messages.Translation.TranslateCommand, word);
        }
    }
};