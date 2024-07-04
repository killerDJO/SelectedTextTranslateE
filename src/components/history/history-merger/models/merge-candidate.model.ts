import type { TranslateDescriptor } from '~/components/translation/models/translation.model';

export interface MergeCandidate {
  readonly id: string;
  readonly record: MergeHistoryRecord;
  readonly mergeRecords: ReadonlyArray<MergeHistoryRecord>;
}

export interface MergeHistoryRecord extends TranslateDescriptor {
  readonly translationsNumber: number;
  readonly id: string;
  readonly translation: string | null;
  readonly suggestion?: string | null;
  readonly baseForms: ReadonlyArray<string>;
  readonly similarWords: ReadonlyArray<string>;
  readonly blacklistedMergeRecords: ReadonlyArray<string>;
  readonly translationsAndDefinitionsNumber: number;
}
