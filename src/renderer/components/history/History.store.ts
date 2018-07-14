import { Module } from "vuex";

import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { MessageBus } from "communication/MessageBus";
import { Messages } from "common/messaging/Messages";
import { RootState } from "root.store";

const messageBus = new MessageBus();

interface HistoryState {
    historyRecords: HistoryRecord[];
}

export const history: Module<HistoryState, RootState> = {
    namespaced: true,
    state: {
        historyRecords: [],
    },
    mutations: {
        setRecords(state: HistoryState, historyRecords: HistoryRecord[]): void {
            state.historyRecords = historyRecords;
        },
    },
    actions: {
        fetchData({ commit }): void {
            messageBus.getValue<HistoryRecord[]>(Messages.HistoryRecords, historyRecords => commit("setRecords", historyRecords));
        },
    }
};