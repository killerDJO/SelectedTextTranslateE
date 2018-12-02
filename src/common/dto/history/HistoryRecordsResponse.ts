import { TranslationKey } from "common/dto/translation/TranslationKey";

export interface HistoryRecordsResponse {
    readonly records: ReadonlyArray<HistoryRecordViewModel>;
    readonly pageNumber: number;
    readonly pageSize: number;
    readonly totalRecords: number;
}

export interface HistoryRecordViewModel extends TranslationKey {
    readonly id: string;
    readonly translation: string | null;
    readonly translationsNumber: number;
    readonly lastTranslatedDate: number;
    readonly isStarred: boolean;
    readonly isArchived: boolean;
    readonly tags: ReadonlyArray<string>;
    readonly isSyncedWithServer: boolean;
}