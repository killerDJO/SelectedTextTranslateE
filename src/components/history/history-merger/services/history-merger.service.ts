import { uniq } from 'lodash-es';

import { logger, type Logger } from '~/services/logger.service';
import type { HistoryRecord } from '~/components/history/models/history-record.model';
import { SortOrder } from '~/components/history/models/sort-order.enum';
import { historyService, type HistoryService } from '~/components/history/services/history.service';
import type {
  MergeCandidate,
  MergeHistoryRecord
} from '~/components/history/history-merger/models/merge-candidate.model';
import { settingsProvider, type SettingsProvider } from '~/services/settings-provider.service';

import {
  mergeCandidatesFinder,
  type MergeCandidatesFinder
} from './merge-candidates-finder.service';

export class HistoryMerger {
  constructor(
    private readonly historyService: HistoryService,
    private readonly mergeCandidatesFinder: MergeCandidatesFinder,
    private readonly settingsProvider: SettingsProvider,
    private readonly logger: Logger
  ) {}

  public async getMergeCandidates(): Promise<ReadonlyArray<MergeCandidate>> {
    const coreSettings = this.settingsProvider.getSettings().core;
    const lastRecordsToScan = coreSettings.lastRecordsToScanForMerge;
    const levenshteinDistance = coreSettings.levenshteinDistanceForMerge;
    const recentRecords = await this.historyService.queryRecords(
      'lastTranslatedDate',
      SortOrder.Desc,
      0,
      lastRecordsToScan,
      {
        starredOnly: false,
        includeArchived: false
      }
    );

    const mergeCandidates = await this.mergeCandidatesFinder.getMergeCandidates(
      recentRecords.records,
      levenshteinDistance
    );
    return this.filterBlacklistedRecords(mergeCandidates);
  }

  public async mergeRecords(sourceRecordId: string, targetRecordId: string): Promise<void> {
    const sourceRecord = await this.historyService.getRecord(sourceRecordId, true);
    const targetRecord = await this.historyService.getRecord(targetRecordId, true);

    if (!sourceRecord || !targetRecord) {
      throw new Error('Invalid operation.');
    }

    this.logger.info(`Merge history records: ${sourceRecord.id} and ${targetRecord.id}`);

    // Sort translation instances by date in descending order
    const mergedTranslationInstances = (targetRecord.instances ?? [])
      .concat(sourceRecord.instances ?? [])
      .sort((a, b) => b.translationDate - a.translationDate);

    const updatedTargetRecord: HistoryRecord = {
      ...targetRecord,
      translationsNumber: targetRecord.translationsNumber + sourceRecord.translationsNumber,
      tags: uniq((targetRecord.tags || []).concat(sourceRecord.tags || [])),
      instances: mergedTranslationInstances
    };

    const updatedSourceRecord: HistoryRecord = {
      ...sourceRecord,
      isArchived: true,
      tags: uniq((sourceRecord.tags || []).concat(['Merged']))
    };

    await Promise.all([
      this.historyService.upsertRecord(updatedSourceRecord),
      this.historyService.upsertRecord(updatedTargetRecord)
    ]);
  }

  public async blacklistRecords(sourceRecordId: string, targetRecordId: string): Promise<void> {
    const sourceRecord = await this.historyService.getRecord(sourceRecordId, true);

    if (!sourceRecord) {
      throw new Error(`History record with id ${sourceRecordId} doesn't exist`);
    }
    const updatedRecord = {
      ...sourceRecord,
      blacklistedMergeRecords: (sourceRecord.blacklistedMergeRecords || []).concat(targetRecordId)
    };

    await this.historyService.upsertRecord(updatedRecord);

    this.logger.info(
      `Records has been added to the merge blacklist. Source: ${sourceRecordId}, Target: ${targetRecordId}`
    );
  }

  private filterBlacklistedRecords(
    candidates: ReadonlyArray<MergeCandidate>
  ): ReadonlyArray<MergeCandidate> {
    return candidates.map(candidate => {
      const mergeCandidate: MergeCandidate = {
        id: candidate.record.id,
        record: candidate.record,
        mergeRecords: candidate.mergeRecords.filter(
          mergeRecord => !this.isBlacklistedCandidate(candidate.record, mergeRecord)
        )
      };
      return mergeCandidate;
    });
  }

  private isBlacklistedCandidate(
    record: MergeHistoryRecord,
    candidate: MergeHistoryRecord
  ): boolean {
    return (
      record.blacklistedMergeRecords.includes(candidate.id) ||
      candidate.blacklistedMergeRecords.includes(record.id)
    );
  }
}

export const historyMerger = new HistoryMerger(
  historyService,
  mergeCandidatesFinder,
  settingsProvider,
  logger
);
