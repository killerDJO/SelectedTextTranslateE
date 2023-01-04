import { uniq } from 'lodash-es';

import { HistorySortColumn } from '@selected-text-translate/common/settings/settings';

import { logger, type Logger } from '~/services/logger';
import type { HistoryRecord } from '../../models/history-record';
import { SortOrder } from '../../models/sort-order';
import { historyService, type HistoryService } from '../../services/history-service';
import type { MergeCandidate, MergeHistoryRecord } from '../models/merge-candidate';

import { mergeCandidatesFinder, type MergeCandidatesFinder } from './merge-candidates-finder';

export class HistoryMerger {
  constructor(
    private readonly historyService: HistoryService,
    private readonly mergeCandidatesFinder: MergeCandidatesFinder,
    private readonly logger: Logger
  ) {}

  public async getMergeCandidates(): Promise<ReadonlyArray<MergeCandidate>> {
    const recentRecords = await this.historyService.queryRecords(
      HistorySortColumn.LastTranslatedDate,
      SortOrder.Desc,
      0,
      10000,
      {
        starredOnly: false,
        includeArchived: false
      }
    );

    const mergeCandidates = this.mergeCandidatesFinder.getMergeCandidates(recentRecords.records);
    return this.filterBlacklistedRecords(mergeCandidates);
  }

  public async mergeRecords(sourceRecordId: string, targetRecordId: string): Promise<void> {
    const sourceRecord = await this.historyService.getRecord(sourceRecordId, true);
    const targetRecord = await this.historyService.getRecord(targetRecordId, true);

    if (!sourceRecord || !targetRecord) {
      throw new Error('Invalid operation.');
    }

    this.logger.info(`Merge history records: ${sourceRecord.id} and ${targetRecord.id}`);

    const updatedTargetRecord: HistoryRecord = {
      ...targetRecord,
      translationsNumber: targetRecord.translationsNumber + sourceRecord.translationsNumber,
      tags: uniq((targetRecord.tags || []).concat(sourceRecord.tags || []))
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

export const historyMerger = new HistoryMerger(historyService, mergeCandidatesFinder, logger);
