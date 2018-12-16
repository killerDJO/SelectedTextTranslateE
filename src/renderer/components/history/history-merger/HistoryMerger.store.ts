import { Module } from "vuex";

import { RootState } from "root.store";

import { MessageBus } from "common/renderer/MessageBus";
import { Messages } from "common/messaging/Messages";
import { MergeCandidate } from "common/dto/history/MergeCandidate";

const messageBus = new MessageBus();

interface HistoryMergerState {
    isActionInProgress: boolean;
    mergeCandidates: ReadonlyArray<MergeCandidate>;
}

export const historyMerger: Module<HistoryMergerState, RootState> = {
    namespaced: true,
    state: {
        isActionInProgress: true,
        mergeCandidates: []
    },
    mutations: {
        setMergeCandidates(state: HistoryMergerState, candidates: ReadonlyArray<MergeCandidate>): void {
            state.mergeCandidates = candidates;
            state.isActionInProgress = false;
        }
    },
    actions: {
        fetchCandidates({ commit }): void {
            commit("setMergeCandidates", []);
            messageBus
                .sendCommand<ReadonlyArray<MergeCandidate>>(Messages.History.Merging.MergeCandidates)
                .then(candidates => commit("setMergeCandidates", candidates));
        }
    }
};