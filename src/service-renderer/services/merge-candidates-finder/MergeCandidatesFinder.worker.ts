import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { MergeCandidate, MergeHistoryRecord } from "common/dto/history/MergeCandidate";
const context: Worker = self as any;

context.addEventListener("message", (event) => {
    const candidatesFinder = new MergeCandidatesFinder();
    context.postMessage(candidatesFinder.getMergeCandidates(event.data));
});

export class MergeCandidatesFinder {
    public getMergeCandidates(records: HistoryRecord[]): ReadonlyArray<MergeCandidate> {
        const mergeRecords: Array<MergeHistoryRecord | null> = records
            .sort((first, second) => second.lastTranslatedDate - first.lastTranslatedDate)
            .map(record => this.convertToMergeRecord(record));

        const result: MergeCandidate[] = [];
        for (let i = 0; i < mergeRecords.length; ++i) {
            const candidates = this.processRecord(i, mergeRecords);

            if (candidates.length > 0) {
                result.push({
                    record: mergeRecords[i] as MergeHistoryRecord,
                    mergeRecords: candidates
                });
            }
        }

        return result;
    }

    private processRecord(recordIndex: number, mergeRecords: Array<MergeHistoryRecord | null>): MergeHistoryRecord[] {
        const candidates: MergeHistoryRecord[] = [];

        const record = mergeRecords[recordIndex];
        if (record === null) {
            return candidates;
        }

        for (let i = recordIndex + 1; i < mergeRecords.length; ++i) {
            const candidateRecord = mergeRecords[i];
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
                mergeRecords[i] = null;
            }
        }

        return candidates;
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