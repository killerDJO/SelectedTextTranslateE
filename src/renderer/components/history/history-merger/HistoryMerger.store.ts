import { Module } from "vuex";
import Vue from "vue";

import { RootState } from "root.store";

import { MessageBus } from "common/renderer/MessageBus";
import { Messages } from "common/messaging/Messages";
import { MergeCandidate, MergeHistoryRecord } from "common/dto/history/MergeCandidate";
import { MergeRecordsRequest } from "common/dto/history/MergeRecordsRequest";

const messageBus = new MessageBus();

interface HistoryMergerState {
    isActionInProgress: boolean;
    mergeCandidates: MergeCandidate[];
}

export const historyMerger: Module<HistoryMergerState, RootState> = {
    namespaced: true,
    state: {
        isActionInProgress: true,
        mergeCandidates: []
    },
    mutations: {
        setMergeCandidates(state: HistoryMergerState, candidates: ReadonlyArray<MergeCandidate>): void {
            state.mergeCandidates = candidates.slice();
            state.isActionInProgress = false;
        },
        removeRecordFromCandidate(state: HistoryMergerState, request: { candidate: MergeCandidate, record: MergeHistoryRecord }): void {
            const currentCandidateIndex = state.mergeCandidates.indexOf(request.candidate);

            Vue.set(state.mergeCandidates, currentCandidateIndex, {
                record: request.candidate.record,
                mergeRecords: request.candidate.mergeRecords.filter(mergeRecord => mergeRecord !== request.record)
            });
        }
    },
    actions: {
        fetchCandidates({ commit }): void {
            commit("setMergeCandidates", []);
            messageBus
                .sendCommand<ReadonlyArray<MergeCandidate>>(Messages.History.Merging.MergeCandidates)
                .then(candidates => commit("setMergeCandidates", candidates));
        },
        mergeRecords({ }, request: MergeRecordsRequest): void {
            messageBus.sendCommand<MergeRecordsRequest>(Messages.History.Merging.MergeRequest, request);
        }
    }
};