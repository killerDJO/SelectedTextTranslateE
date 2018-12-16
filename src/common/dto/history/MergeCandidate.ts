import { TranslationKey } from "common/dto/translation/TranslationKey";

export interface MergeCandidate {
    readonly record: MergeHistoryRecord;
    readonly candidates: ReadonlyArray<MergeHistoryRecord>;
}

export interface MergeHistoryRecord extends TranslationKey {
    readonly translationsNumber: number;
    readonly id: string;
    readonly translation: string | null;
}