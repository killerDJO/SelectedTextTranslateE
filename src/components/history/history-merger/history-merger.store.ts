import { defineStore } from 'pinia';

import { useGlobalErrorsStore } from '~/components/global-errors/global-errors.store';
import { useHistoryStore } from '~/components/history/history.store';

import type { MergeCandidate } from './models/merge-candidate.model';
import { historyMerger } from './services/history-merger.service';

interface HistoryMergerState {
  isActionInProgress: boolean;
  mergeCandidates: MergeCandidate[];
}

export const useHistoryMergerStore = defineStore('history-merger', {
  state: () => {
    const state: HistoryMergerState = {
      isActionInProgress: false,
      mergeCandidates: []
    };
    return state;
  },
  getters: {},
  actions: {
    async fetchCandidates() {
      try {
        this.mergeCandidates = [];
        this.isActionInProgress = true;
        this.mergeCandidates = (await historyMerger.getMergeCandidates()).slice();
      } catch (e) {
        useGlobalErrorsStore().addError('Unable to fetch merge records', e);
      } finally {
        this.isActionInProgress = false;
      }
    },
    async mergeRecords(sourceRecordId: string, targetRecordId: string) {
      await historyMerger.mergeRecords(sourceRecordId, targetRecordId);
      useHistoryStore().refreshRecords();
    },
    async blacklistRecords(sourceRecordId: string, targetRecordId: string) {
      await historyMerger.blacklistRecords(sourceRecordId, targetRecordId);
      useHistoryStore().refreshRecords();
    }
  }
});
