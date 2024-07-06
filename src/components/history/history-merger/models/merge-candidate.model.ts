import { HistoryRecord } from '~/components/history/models/history-record.model';

export interface MergeCandidate {
  readonly id: string;
  readonly record: MergeHistoryRecord;
  readonly mergeRecords: ReadonlyArray<MergeHistoryRecord>;
}

export interface MergeHistoryRecord extends HistoryRecord {
  readonly translation: string | null;
  readonly suggestion?: string | null;
  readonly baseForms: ReadonlyArray<string>;
  readonly similarWords: ReadonlyArray<string>;
  readonly translationsAndDefinitionsNumber: number;
}
