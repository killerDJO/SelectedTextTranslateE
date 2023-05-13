import { defineStore } from 'pinia';

import { HistorySortColumn, type Tag } from '@selected-text-translate/common/settings/settings';

import { useAppStore } from '~/app.store';
import { textPlayer } from '~/components/translation/services/text-player';
import { useGlobalErrorsStore } from '~/components/global-errors/global-errors.store';
import { useTranslateResultStore } from '~/components/translation/translation-result/translation-result.store';

import type { HistoryFilter } from './models/history-filter';
import type { HistoryRecord } from './models/history-record';
import { SortOrder } from './models/sort-order';
import { historyService } from './services/history-service';

interface HistoryState {
  isLoading: boolean;
  filter: HistoryFilter;
  sortColumn: HistorySortColumn;
  sortOrder: SortOrder;
  pageNumber: number;
  totalRecords: number;
  records: HistoryRecord[] | null;
}

export const useHistoryStore = defineStore('history', {
  state: () => {
    const state: HistoryState = {
      filter: { starredOnly: false, includeArchived: false },
      sortColumn: HistorySortColumn.LastTranslatedDate,
      sortOrder: SortOrder.Desc,
      pageNumber: 0,
      totalRecords: 0,
      records: null,
      isLoading: false
    };
    return state;
  },
  getters: {
    pageSize: () => useAppStore().settings.views.history.renderer.pageSize,
    totalPages: state => Math.ceil(state.totalRecords / (state as any).pageSize)
  },
  actions: {
    setup() {
      window.mainAPI.translation.onHistoryRecordChange(id => {
        queryRecordsInternal(this, true);
        updateTranslationIfNecessary(id);
      });
    },
    async queryRecords(): Promise<void> {
      try {
        this.isLoading = true;
        await queryRecordsInternal(this);
      } finally {
        this.isLoading = false;
      }
    },
    async refreshRecords(): Promise<void> {
      await queryRecordsInternal(this, true);
    },
    async setStarredStatus(record: HistoryRecord, isStarred: boolean) {
      await updateRecord(this, record.id, () => historyService.setStarredStatus(record, isStarred));
    },
    async playRecord(record: HistoryRecord) {
      const translation = record.translateResult.sentence.origin;
      if (translation) {
        await textPlayer.playText({ text: translation, language: record.sourceLanguage });
      }
    },
    async updateTags(record: HistoryRecord, tags: ReadonlyArray<Tag>) {
      await updateRecord(this, record.id, () => historyService.updateTags(record, tags));
    },
    async setArchivedStatus(record: HistoryRecord, isArchived: boolean) {
      await updateRecord(this, record.id, () =>
        historyService.setArchivedStatus(record, isArchived)
      );
    },
    openSettings() {
      window.mainAPI.settings.showHistorySettings();
    }
  }
});

type HistoryStore = ReturnType<typeof useHistoryStore>;

async function updateRecord(store: HistoryStore, id: string, action: () => Promise<void>) {
  try {
    const actionPromise = action();
    await queryRecordsInternal(store, true);
    updateTranslationIfNecessary(id);
    await actionPromise;
  } catch (e: unknown) {
    useGlobalErrorsStore().addError('Unable to update history record.', e);
  }
}

async function updateTranslationIfNecessary(id: string) {
  const translationStore = useTranslateResultStore();
  if (translationStore.historyRecord?.id === id) {
    const record = await historyService.getRecord(id, true);
    translationStore.patchHistoryRecord(record!);
  }
}

async function queryRecordsInternal(store: HistoryStore, cachedOnly = false): Promise<void> {
  try {
    const { records, total } = await historyService.queryRecords(
      store.sortColumn,
      store.sortOrder,
      (store.pageNumber - 1) * store.pageSize,
      store.pageSize,
      store.filter,
      cachedOnly
    );
    store.records = records;
    store.totalRecords = total;

    // In case last page no longer has any data, fetch records for last available page
    if (store.pageNumber > store.totalPages) {
      store.pageNumber = store.totalPages;
      await queryRecordsInternal(store, cachedOnly);
    }
  } catch (e: unknown) {
    useGlobalErrorsStore().addError('Unable to load history records.', e);
  }
}