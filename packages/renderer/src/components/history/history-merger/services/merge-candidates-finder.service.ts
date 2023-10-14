import type { HistoryRecord } from '~/components/history/models/history-record.model';
import type {
  MergeCandidate,
  MergeHistoryRecord
} from '~/components/history/history-merger/models/merge-candidate.model';

export class MergeCandidatesFinder {
  public getMergeCandidates(records: HistoryRecord[]): ReadonlyArray<MergeCandidate> {
    const mergeRecords: Array<MergeHistoryRecord | null> = records
      .sort((first, second) => second.lastTranslatedDate - first.lastTranslatedDate)
      .map(record => this.convertToMergeRecord(record));

    const result: MergeCandidate[] = [];
    for (let i = 0; i < mergeRecords.length; ++i) {
      const candidates = this.processRecord(i, mergeRecords);

      if (candidates.length > 0) {
        result.push(
          this.checkForPromotion({
            id: mergeRecords[i]!.id,
            record: mergeRecords[i] as MergeHistoryRecord,
            mergeRecords: candidates
          })
        );
      }
    }

    return result;
  }

  private processRecord(
    recordIndex: number,
    mergeRecords: Array<MergeHistoryRecord | null>
  ): MergeHistoryRecord[] {
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

      if (
        record.sourceLanguage !== candidateRecord.sourceLanguage ||
        record.targetLanguage !== candidateRecord.targetLanguage
      ) {
        continue;
      }

      if (this.isMergeCandidate(record, candidateRecord)) {
        candidates.push(candidateRecord);
        mergeRecords[i] = null;
      }
    }

    return candidates;
  }

  private isMergeCandidate(target: MergeHistoryRecord, source: MergeHistoryRecord): boolean {
    if (this.equalsIgnoreCase(target.sentence, source.sentence)) {
      return true;
    }

    if (
      this.equalsIgnoreCase(target.suggestion, source.suggestion) ||
      this.equalsIgnoreCase(source.suggestion, target.sentence) ||
      this.equalsIgnoreCase(target.suggestion, source.sentence)
    ) {
      return true;
    }

    if (
      this.containsIgnoreCase(target.sentence, source.baseForms) ||
      this.containsIgnoreCase(source.sentence, target.baseForms)
    ) {
      return true;
    }

    if (
      this.containsIgnoreCase(target.sentence, source.similarWords) ||
      this.containsIgnoreCase(source.sentence, target.similarWords)
    ) {
      return true;
    }

    return false;
  }

  private containsIgnoreCase(text: string, items: ReadonlyArray<string>) {
    return items.some(item => this.equalsIgnoreCase(item, text));
  }

  private equalsIgnoreCase(
    first: string | null | undefined,
    second: string | null | undefined
  ): boolean {
    if (!first || !second) {
      return false;
    }
    return first.toLowerCase() === second.toLowerCase();
  }

  private convertToMergeRecord(record: HistoryRecord): MergeHistoryRecord {
    return {
      sentence: record.sentence,
      isForcedTranslation: record.isForcedTranslation,
      sourceLanguage: record.sourceLanguage,
      targetLanguage: record.targetLanguage,
      translationsNumber: record.translationsNumber,
      id: record.id,
      translation: record.translateResult.sentence.translation,
      suggestion: record.translateResult.sentence.suggestion,
      baseForms: record.translateResult.categories.map(category => category.baseForm),
      similarWords: record.translateResult.sentence.similarWords || [],
      blacklistedMergeRecords: record.blacklistedMergeRecords || []
    };
  }

  private checkForPromotion(candidate: MergeCandidate): MergeCandidate {
    if (candidate.record.suggestion) {
      const suggestionInChildren = candidate.mergeRecords.find(record =>
        this.equalsIgnoreCase(record.sentence, candidate.record.suggestion)
      );
      if (suggestionInChildren) {
        return this.promoteRecord(candidate, suggestionInChildren);
      }
    }

    const baseFormsInChildren = candidate.mergeRecords.find(record =>
      this.containsIgnoreCase(record.sentence, candidate.record.baseForms)
    );
    if (baseFormsInChildren) {
      return this.promoteRecord(candidate, baseFormsInChildren);
    }

    const similarWordsInChildren = candidate.mergeRecords.find(record =>
      this.containsIgnoreCase(record.sentence, candidate.record.similarWords)
    );
    if (similarWordsInChildren) {
      return this.promoteRecord(candidate, similarWordsInChildren);
    }

    return candidate;
  }

  private promoteRecord(
    candidate: MergeCandidate,
    recordToPromote: MergeHistoryRecord
  ): MergeCandidate {
    return {
      id: recordToPromote.id,
      record: recordToPromote,
      mergeRecords: candidate.mergeRecords
        .filter(record => record !== recordToPromote)
        .concat([candidate.record])
    };
  }
}

export const mergeCandidatesFinder = new MergeCandidatesFinder();
