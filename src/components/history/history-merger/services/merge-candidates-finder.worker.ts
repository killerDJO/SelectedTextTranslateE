import levenshtein from 'fast-levenshtein';

import type { HistoryRecord } from '~/components/history/models/history-record.model';
import type {
  MergeCandidate,
  MergeHistoryRecord
} from '~/components/history/history-merger/models/merge-candidate.model';

const context: Worker = self as unknown as Worker;

context.addEventListener('message', event => {
  const candidatesFinder = new MergeCandidatesFinder();
  const { records, maxLevenshteinDistance } = event.data;
  context.postMessage(candidatesFinder.getMergeCandidates(records, maxLevenshteinDistance));
});

export default class MergeCandidatesFinder {
  public getMergeCandidates(
    records: HistoryRecord[],
    maxLevenshteinDistance: number
  ): ReadonlyArray<MergeCandidate> {
    const mergeRecords: Array<MergeHistoryRecord | null> = records
      .sort((first, second) => second.lastTranslatedDate - first.lastTranslatedDate)
      .map(record => this.convertToMergeRecord(record));

    const result: MergeCandidate[] = [];
    for (let i = 0; i < mergeRecords.length; ++i) {
      const candidates = this.processRecord(i, mergeRecords, maxLevenshteinDistance);

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
    mergeRecords: Array<MergeHistoryRecord | null>,
    maxLevenshteinDistance: number
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

      if (this.isMergeCandidate(record, candidateRecord, maxLevenshteinDistance)) {
        candidates.push(candidateRecord);
        mergeRecords[i] = null;
      }
    }

    return candidates;
  }

  private isMergeCandidate(
    target: MergeHistoryRecord,
    source: MergeHistoryRecord,
    maxLevenshteinDistance: number
  ): boolean {
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

    if (levenshtein.get(target.sentence, source.sentence) <= maxLevenshteinDistance) {
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
      ...record,
      translation: record.translateResult.sentence.translation,
      suggestion: record.translateResult.sentence.suggestion,
      baseForms: record.translateResult.categories.map(category => category.baseForm),
      similarWords: record.translateResult.sentence.similarWords || [],
      translationsAndDefinitionsNumber:
        record.translateResult.categories.length + record.translateResult.definitions.length
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

    let maxTranslationsRecord = candidate.record;
    for (const record of candidate.mergeRecords) {
      if (
        record.translationsAndDefinitionsNumber >
        maxTranslationsRecord.translationsAndDefinitionsNumber
      ) {
        maxTranslationsRecord = record;
      }
    }

    if (maxTranslationsRecord !== candidate.record) {
      return this.promoteRecord(candidate, maxTranslationsRecord);
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
