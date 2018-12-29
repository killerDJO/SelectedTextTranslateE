import { injectable } from "inversify";
import { Observable, concat } from "rxjs";
import { map, concatMap } from "rxjs/operators";
import * as _ from "lodash";

import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { MergeRecordsRequest } from "common/dto/history/MergeRecordsRequest";
import { MergeCandidate, MergeHistoryRecord } from "common/dto/history/MergeCandidate";

import { HistoryStore } from "business-logic/history/HistoryStore";

@injectable()
export class HistoryMerger {

    constructor(private readonly historyStore: HistoryStore) {
    }

    public mergeRecords(request: MergeRecordsRequest): Observable<void> {
        return this.historyStore.getRecord(request.sourceRecord).pipe(
            concatMap(sourceRecord => this.historyStore.getRecord(request.targetRecord)
                .pipe(concatMap(targetRecord => this.mergeRecordsInternal(sourceRecord, targetRecord))))
        );
    }

    public getMergeCandidates(): Observable<ReadonlyArray<MergeCandidate>> {
        return this.historyStore.getActiveRecords().pipe(
            map(records => this.processHistoryRecords(records))
        );
    }

    private mergeRecordsInternal(sourceRecord: HistoryRecord | null, targetRecord: HistoryRecord | null): Observable<void> {
        if (sourceRecord === null || targetRecord === null) {
            throw new Error("Invalid operation.");
        }

        const updatedTargetRecord: HistoryRecord = {
            ...targetRecord,
            translationsNumber: targetRecord.translationsNumber + sourceRecord.translationsNumber,
            tags: _.uniq((targetRecord.tags || []).concat(sourceRecord.tags || []))
        }

        const updatedSourceRecord: HistoryRecord = {
            ...sourceRecord,
            isArchived: true,
            tags: _.uniq((sourceRecord.tags || []).concat(["Merged"]))
        }

        return concat(this.historyStore.updateRecord(updatedTargetRecord), this.historyStore.updateRecord(updatedSourceRecord)).pipe(map(() => void 0));
    }

    private processHistoryRecords(records: HistoryRecord[]): ReadonlyArray<MergeCandidate> {
        const mergeRecords = records.map(record => this.convertToMergeRecord(record));

        const result: MergeCandidate[] = [];
        for (let i = 0; i < mergeRecords.length; ++i) {
            const record = mergeRecords[i];
            const candidates: MergeHistoryRecord[] = [];

            for (let j = i + 1; j < mergeRecords.length; ++j) {
                const candidateRecord = mergeRecords[j];
                if (record.sourceLanguage !== candidateRecord.sourceLanguage
                    || record.targetLanguage !== candidateRecord.targetLanguage
                    || record.isForcedTranslation !== candidateRecord.isForcedTranslation) {
                    continue;
                }

                if (record.sentence.toLowerCase() === candidateRecord.sentence.toLowerCase()) {
                    candidates.push(candidateRecord);
                }
            }

            if (candidates.length > 0) {
                result.push({
                    record: record,
                    mergeRecords: candidates
                });
            }
        }

        return result;
    }

    private convertToMergeRecord(record: HistoryRecord): MergeHistoryRecord {
        return {
            sentence: record.sentence,
            isForcedTranslation: record.isForcedTranslation,
            sourceLanguage: record.sourceLanguage,
            targetLanguage: record.targetLanguage,
            translationsNumber: record.translationsNumber,
            id: record.id,
            translation: record.translateResult.sentence.translation
        };
    }
}