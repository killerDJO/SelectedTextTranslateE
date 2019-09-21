import { Module } from "vuex";
import Vue from "vue";

import { RootState } from "root.store";

import { MessageBus } from "common/renderer/MessageBus";
import { Messages } from "common/messaging/Messages";
import { MergeCandidate, MergeHistoryRecord } from "common/dto/history/MergeCandidate";
import { MergeRecordsRequest } from "common/dto/history/MergeRecordsRequest";
import { BlacklistRecordsRequest } from "common/dto/history/BlacklistRecordsRequest";

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
        setInProgress(state: HistoryMergerState): void {
            state.isActionInProgress = true;
        },
        removeRecordFromCandidate(state: HistoryMergerState, { candidate, record }: { candidate: MergeCandidate; record: MergeHistoryRecord }): void {
            const currentCandidateIndex = state.mergeCandidates.indexOf(candidate);

            Vue.set(state.mergeCandidates, currentCandidateIndex, {
                record: candidate.record,
                mergeRecords: candidate.mergeRecords.filter(mergeRecord => mergeRecord !== record)
            });
        },
        promoteRecordToCandidate(state: HistoryMergerState, { candidate, record }: { candidate: MergeCandidate; record: MergeHistoryRecord }): void {
            const currentCandidateIndex = state.mergeCandidates.indexOf(candidate);

            Vue.set(state.mergeCandidates, currentCandidateIndex, {
                record: record,
                mergeRecords: candidate.mergeRecords.filter(mergeRecord => mergeRecord !== record).concat([candidate.record])
            });
        }
    },
    actions: {
        fetchCandidates({ commit }): void {
            commit("setMergeCandidates", []);
            commit("setInProgress");
            messageBus
                .sendCommand<ReadonlyArray<MergeCandidate>>(Messages.History.Merging.MergeCandidates)
                .then(candidates => commit("setMergeCandidates", candidates));
        },
        mergeRecords({ }, request: MergeRecordsRequest): void {
            messageBus.sendCommand<MergeRecordsRequest>(Messages.History.Merging.MergeRequest, request);
        },
        blacklistRecords({ }, request: BlacklistRecordsRequest): void {
            messageBus.sendCommand<BlacklistRecordsRequest>(Messages.History.Merging.BlacklistRequest, request);
        }
    }
};