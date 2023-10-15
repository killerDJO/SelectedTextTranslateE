import { cloneDeep, uniq } from 'lodash-es';

import type { HistoryColumn, Tag } from '@selected-text-translate/common';

import type { HistoryRecord } from '~/components/history/models/history-record.model';
import type { HistoryFilter } from '~/components/history/models/history-filter.model';
import type { SortOrder } from '~/components/history/models/sort-order.enum';
import type {
  TranslateDescriptor,
  TranslateResult
} from '~/components/translation/models/translation.model';
import { settingsProvider, type SettingsProvider } from '~/services/settings-provider.service';
import { normalizeTag } from '~/utils/tags.utils';
import { logger, type Logger } from '~/services/logger.service';
import { getLogKey } from '~/utils/logging.utils';
import {
  authService,
  type AuthService
} from '~/components/history/history-auth/services/auth.service';

import { historyDatabase, type HistoryDatabase } from './history-database.service';
import { historyCache, type HistoryCache } from './history-cache.service';

export class HistoryService {
  constructor(
    private readonly historyDatabase: HistoryDatabase,
    private readonly historyCache: HistoryCache,
    private readonly settingsProvider: SettingsProvider,
    private readonly logger: Logger,
    private readonly authService: AuthService
  ) {}

  public async getRecord(id: string, cachedOnly = false): Promise<HistoryRecord | undefined> {
    if (!cachedOnly) {
      const record = await this.historyDatabase.getRecord(id);
      if (record) {
        await this.historyCache.patchRecord(record);
      }
    }

    return await this.historyCache.getRecord(id);
  }

  public async queryRecords(
    sortColumn: HistoryColumn,
    sortOrder: SortOrder,
    start: number,
    limit: number,
    filter: HistoryFilter,
    cachedOnly = false
  ) {
    return this.historyCache.queryRecords(sortColumn, sortOrder, start, limit, filter, cachedOnly);
  }

  public async createHistoryRecord(
    id: string,
    descriptor: TranslateDescriptor,
    translateResult: TranslateResult
  ): Promise<HistoryRecord> {
    const currentTime = new Date().getTime();
    const historyRecord = {
      id: id,
      sentence: descriptor.sentence,
      translateResult: translateResult,
      translationsNumber: 1,
      isForcedTranslation: descriptor.isForcedTranslation,
      sourceLanguage: descriptor.sourceLanguage,
      targetLanguage: descriptor.targetLanguage,
      createdDate: currentTime,
      updatedDate: currentTime,
      lastTranslatedDate: currentTime,
      isStarred: false,
      isArchived: false,
      lastModifiedDate: currentTime,
      tags: this.getActiveCurrentTags(),
      user: (await this.authService.getAccount())!.uid,
      instances: [
        {
          translationDate: currentTime,
          tags: this.getActiveCurrentTags()
        }
      ]
    };

    await this.upsertRecord(historyRecord);

    this.logger.info(`[History]: Translation ${getLogKey(descriptor)} is saved to history.`);

    return historyRecord;
  }

  public async updateHistoryRecord(
    record: HistoryRecord,
    translateResult: TranslateResult,
    incrementTranslationsNumber: boolean,
    addTags: boolean
  ): Promise<HistoryRecord> {
    const currentTime = new Date().getTime();

    const instances = record.instances?.slice() ?? [];
    if (incrementTranslationsNumber) {
      instances.push({
        translationDate: currentTime,
        tags: this.getActiveCurrentTags()
      });
    }

    const historyRecord: HistoryRecord = {
      ...record,
      translateResult: translateResult,
      lastModifiedDate: currentTime,
      tags: addTags ? this.getTags(record) : record.tags,
      lastTranslatedDate: incrementTranslationsNumber ? currentTime : record.lastTranslatedDate,
      translationsNumber: incrementTranslationsNumber
        ? record.translationsNumber + 1
        : record.translationsNumber,
      instances: instances
    };

    await this.upsertRecord(historyRecord);

    this.logger.info(`[History]: Translation ${getLogKey(record)} is updated in history.`);

    return historyRecord;
  }

  public async upsertRecord(record: HistoryRecord): Promise<void> {
    // Make sure record is a plain object and has tracking fields
    const clonedRecord = cloneDeep({ ...record, updatedDate: Date.now() });
    await this.historyCache.patchRecord(clonedRecord);

    // Do not await for remote write, cache serves as a main data source
    this.historyDatabase.upsertRecord(clonedRecord);
  }

  private getTags(record: HistoryRecord): ReadonlyArray<string> {
    return uniq((record.tags || []).concat(this.getActiveCurrentTags()))
      .sort()
      .slice();
  }

  private getActiveCurrentTags(): ReadonlyArray<string> {
    return (
      this.settingsProvider
        .getSettings()
        .tags.currentTags?.map(normalizeTag)
        .filter(tag => tag.isEnabled)
        .map(tag => tag.tag) ?? []
    );
  }

  public async setStarredStatus(record: HistoryRecord, isStarred: boolean) {
    await this.upsertRecord({ ...record, isStarred });
  }

  public async updateTags(record: HistoryRecord, tags: ReadonlyArray<Tag>) {
    await this.upsertRecord({ ...record, tags: tags.map(tag => tag.tag) });
  }

  public async setArchivedStatus(record: HistoryRecord, isArchived: boolean) {
    await this.upsertRecord({ ...record, isArchived });
  }

  public async hardDelete(id: string) {
    await this.historyCache.deleteRecord(id);
    await this.historyDatabase.deleteRecord(id);
  }
}

export const historyService = new HistoryService(
  historyDatabase,
  historyCache,
  settingsProvider,
  logger,
  authService
);
