import { injectable } from "inversify";

import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { MergeCandidate, MergeHistoryRecord } from "common/dto/history/MergeCandidate";

@injectable()
export class MergeCandidatesFinder {
    public getMergeCandidates(records: HistoryRecord[]): ReadonlyArray<MergeCandidate> {
        const mergeRecords: Array<MergeHistoryRecord | null> = records.map(record => this.convertToMergeRecord(record));

        const result: MergeCandidate[] = [];
        for (let i = 0; i < mergeRecords.length; ++i) {
            const record = mergeRecords[i];
            if (record === null) {
                continue;
            }

            const candidates: MergeHistoryRecord[] = [];

            for (let j = i + 1; j < mergeRecords.length; ++j) {
                const candidateRecord = mergeRecords[j];
                if (candidateRecord === null) {
                    continue;
                }

                if (record.sourceLanguage !== candidateRecord.sourceLanguage
                    || record.targetLanguage !== candidateRecord.targetLanguage
                    || record.isForcedTranslation !== candidateRecord.isForcedTranslation) {
                    continue;
                }

                if (record.sentence.toLowerCase() === candidateRecord.sentence.toLowerCase()) {
                    candidates.push(candidateRecord);
                    mergeRecords[j] = null;
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