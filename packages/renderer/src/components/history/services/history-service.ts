import { cloneDeep, uniq } from 'lodash-es';

import type { HistorySortColumn, Tag } from '@selected-text-translate/common/settings/settings';

import type { HistoryRecord } from '~/components/history/models/history-record';
import type { HistoryFilter } from '~/components/history/models/history-filter';
import type { SortOrder } from '~/components/history/models/sort-order';
import type {
  TranslateDescriptor,
  TranslateResult
} from '~/components/translation/models/translation';
import { settingsProvider, type SettingsProvider } from '~/services/settings-provider';
import { normalizeTag } from '~/utils/normalize-tag';
import { logger, type Logger } from '~/services/logger';
import { getLogKey } from '~/utils/logging';
import {
  authService,
  type AuthService
} from '~/components/history/history-auth/services/auth-service';

import { historyDatabase, type HistoryDatabase } from './history-database';
import { historyCache, type HistoryCache } from './history-cache';

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
      await this.historyCache.refreshRecords();
    }

    return await this.historyCache.getRecord(id);
  }

  public async queryRecords(
    sortColumn: HistorySortColumn,
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
      user: (await this.authService.getAccount())!.uid
    };

    await this.upsertRecord(historyRecord);

    this.logger.info(`Translation ${getLogKey(descriptor)} is saved to history.`);

    return historyRecord;
  }

  public async updateHistoryRecord(
    record: HistoryRecord,
    translateResult: TranslateResult,
    incrementTranslationsNumber: boolean,
    addTags: boolean
  ): Promise<HistoryRecord> {
    const currentTime = new Date().getTime();
    const historyRecord: HistoryRecord = {
      ...record,
      translateResult: translateResult,
      lastModifiedDate: currentTime,
      tags: addTags ? this.getTags(record) : record.tags,
      lastTranslatedDate: incrementTranslationsNumber ? currentTime : record.lastTranslatedDate,
      translationsNumber: incrementTranslationsNumber
        ? record.translationsNumber + 1
        : record.translationsNumber
    };

    await this.upsertRecord(historyRecord);

    this.logger.info(`Translation ${getLogKey(record)} is updated in history.`);

    return historyRecord;
  }

  public async incrementTranslationsNumber(record: HistoryRecord): Promise<HistoryRecord> {
    const currentTime = new Date().getTime();
    const historyRecord: HistoryRecord = {
      ...record,
      lastTranslatedDate: currentTime,
      translationsNumber: record.translationsNumber + 1,
      tags: this.getTags(record)
    };

    await this.upsertRecord(historyRecord);

    this.logger.info(`Translations number ${getLogKey(record)} is incremented.`);

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
}

export const historyService = new HistoryService(
  historyDatabase,
  historyCache,
  settingsProvider,
  logger,
  authService
);
