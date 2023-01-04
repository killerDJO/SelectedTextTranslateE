import { orderBy } from 'lodash-es';
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { add } from 'date-fns';

import { HistorySortColumn } from '@selected-text-translate/common/settings/settings';

import type { HistoryRecord } from '~/components/history/models/history-record';
import type { SortOrder } from '~/components/history/models/sort-order';
import type { HistoryFilter } from '~/components/history/models/history-filter';
import {
  authService,
  type AuthService
} from '~/components/history/history-auth/services/auth-service';

import { historyDatabase, type HistoryDatabase } from './history-database';

const HISTORY_DB_NAME = 'History';

interface HistoryDB extends DBSchema {
  lastSyncedTimestamp: {
    key: string;
    value: number;
  };
  history: {
    key: string;
    value: HistoryRecord;
    indexes: { user: string };
  };
}

export class HistoryCache {
  private db: Promise<IDBPDatabase<HistoryDB>> | null = null;

  constructor(
    private readonly historyDatabase: HistoryDatabase,
    private readonly authService: AuthService
  ) {}

  public async queryRecords(
    sortColumn: HistorySortColumn,
    sortOrder: SortOrder,
    start: number,
    limit: number,
    filter: HistoryFilter,
    cachedOnly = false
  ): Promise<{ records: HistoryRecord[]; total: number }> {
    const db = await this.ensureInitialized();

    if (!cachedOnly) {
      await this.refreshRecordsInternal(db);
    }

    const allRecords = (await db.getAllFromIndex('history', 'user', await this.getUserId())) ?? [];
    const filteredRecords = this.filterRecords(allRecords, filter);
    const sortedRecords = this.sortRecords(filteredRecords, sortColumn, sortOrder);
    const paginatedRecords = sortedRecords.slice(start, start + limit);
    return { records: paginatedRecords, total: filteredRecords.length };
  }

  public async refreshRecords(): Promise<void> {
    const db = await this.ensureInitialized();
    await this.refreshRecordsInternal(db);
  }

  public async getRecord(id: string): Promise<HistoryRecord | undefined> {
    const db = await this.ensureInitialized();
    return await db.get('history', id);
  }

  public async patchRecord(record: HistoryRecord) {
    const db = await this.ensureInitialized();
    await db.put('history', record);
  }

  public async getAllTags(): Promise<string[]> {
    const db = await this.ensureInitialized();

    const allRecords = (await db.getAllFromIndex('history', 'user', await this.getUserId())) ?? [];

    const tags = new Set<string>();
    allRecords.forEach(record => record.tags?.forEach(tag => tags.add(tag)));

    return Array.from(tags.keys());
  }

  public async clearUserData(userId: string) {
    const db = await this.ensureInitialized();

    const index = db.transaction('history').store.index('user');
    for await (const cursor of index.iterate(userId)) {
      await db.delete('history', cursor.value.id);
    }

    await db.delete('lastSyncedTimestamp', userId);
  }

  private async getLastSyncedTimestamp(db: IDBPDatabase<HistoryDB>): Promise<number> {
    return (await db.get('lastSyncedTimestamp', await this.getUserId())) ?? 0;
  }

  private async setLastSyncedTimestamp(db: IDBPDatabase<HistoryDB>, value: number) {
    db.put('lastSyncedTimestamp', value, await this.getUserId());
  }

  private async getUserId(): Promise<string> {
    const account = await this.authService.getAccount();
    if (!account) {
      throw new Error("User isn't available.");
    }

    return account.uid;
  }

  private async refreshRecordsInternal(db: IDBPDatabase<HistoryDB>): Promise<void> {
    const lastSyncedTimestamp = await this.getLastSyncedTimestamp(db);
    const newRecords = await this.historyDatabase.getRecords(lastSyncedTimestamp);

    let maxTimestamp = lastSyncedTimestamp;
    for (const record of newRecords) {
      await db.put('history', record);
      maxTimestamp = Math.max(maxTimestamp, record.updatedDate);
    }

    await this.setLastSyncedTimestamp(db, maxTimestamp);
  }

  private sortRecords(
    records: HistoryRecord[],
    sortColumn: HistorySortColumn,
    sortOrder: SortOrder
  ): HistoryRecord[] {
    const sortColumnMap = {
      [HistorySortColumn.Input]: 'sentence',
      [HistorySortColumn.TimesTranslated]: 'translationsNumber',
      [HistorySortColumn.LastTranslatedDate]: 'lastTranslatedDate',
      [HistorySortColumn.Translation]: 'translateResult.sentence.translation',
      [HistorySortColumn.SourceLanguage]: 'sourceLanguage',
      [HistorySortColumn.TargetLanguage]: 'targetLanguage',
      [HistorySortColumn.IsArchived]: 'isArchived',
      [HistorySortColumn.Tags]: 'tags'
    };

    return orderBy(records, [sortColumnMap[sortColumn]], [sortOrder]);
  }

  private filterRecords(records: HistoryRecord[], filter: HistoryFilter): HistoryRecord[] {
    return records.filter(record => {
      const starredCondition = !filter.starredOnly || record.isStarred;
      const archivedCondition = !!filter.includeArchived || !record.isArchived;

      const wordCondition =
        !filter.word || record.sentence.toLowerCase().includes(filter.word.toLowerCase());
      const translationCondition =
        !filter.translation ||
        record.translateResult.sentence.translation
          ?.toLowerCase()
          .includes(filter.translation.toLowerCase());

      const minTranslationsCondition =
        !filter.minTranslatedTime || record.translationsNumber >= filter.minTranslatedTime;
      const maxTranslationsCondition =
        !filter.maxTranslatedTime || record.translationsNumber <= filter.maxTranslatedTime;

      const tagsCondition =
        !filter.tags?.length || filter.tags.every(tag => record.tags?.includes(tag));

      const minTranslationDateCondition =
        !filter.minLastTranslatedDate ||
        record.lastTranslatedDate >= filter.minLastTranslatedDate.getTime();

      const maxLastTranslatedDate = filter.maxLastTranslatedDate
        ? add(filter.maxLastTranslatedDate, {
            hours: 23,
            minutes: 59,
            seconds: 59
          })
        : undefined;
      maxLastTranslatedDate?.setMilliseconds(999);
      const maxTranslationDateCondition =
        !maxLastTranslatedDate || record.lastTranslatedDate <= maxLastTranslatedDate.getTime();

      const sourceLanguageCondition =
        !filter.sourceLanguage || record.sourceLanguage === filter.sourceLanguage;
      const targetLanguageCondition =
        !filter.targetLanguage || record.targetLanguage === filter.targetLanguage;

      return (
        starredCondition &&
        archivedCondition &&
        wordCondition &&
        translationCondition &&
        minTranslationsCondition &&
        maxTranslationsCondition &&
        tagsCondition &&
        minTranslationDateCondition &&
        maxTranslationDateCondition &&
        sourceLanguageCondition &&
        targetLanguageCondition
      );
    });
  }

  private ensureInitialized(): Promise<IDBPDatabase<HistoryDB>> {
    if (!this.db) {
      this.db = openDB<HistoryDB>(HISTORY_DB_NAME, 1, {
        upgrade(db) {
          db.createObjectStore('lastSyncedTimestamp');
          const historyStore = db.createObjectStore('history', {
            keyPath: 'id',
            autoIncrement: false
          });
          historyStore.createIndex('user', 'user');
        }
      });
    }

    return this.db;
  }
}

export const historyCache = new HistoryCache(historyDatabase, authService);
