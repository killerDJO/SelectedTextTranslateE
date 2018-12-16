import { injectable } from "inversify";
import * as Datastore from "nedb";
import { Observable } from "rxjs";

import { MergeCandidate, MergeHistoryRecord } from "common/dto/history/MergeCandidate";
import { DatastoreProvider } from "data-access/DatastoreProvider";
import { HistoryDatabaseProvider } from "business-logic/history/persistence/HistoryDatabaseProvider";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { map } from "rxjs/operators";

@injectable()
export class HistoryMerger {

    private readonly database$: Observable<Datastore>;

    constructor(private readonly datastoreProvider: DatastoreProvider, historyDatabaseProvider: HistoryDatabaseProvider) {
        this.database$ = historyDatabaseProvider.historyDatastore$;
    }

    public getMergeCandidates(): Observable<ReadonlyArray<MergeCandidate>> {
        return this.datastoreProvider.find<HistoryRecord>(this.database$, {}).pipe(
            map(records => this.processHistoryRecords(records))
        );
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
                    candidates: candidates
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