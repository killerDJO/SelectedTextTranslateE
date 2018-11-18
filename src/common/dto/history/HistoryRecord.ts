import { TranslateResult } from "common/dto/translation/TranslateResult";

export interface HistoryRecord {
    readonly id: string;
    readonly sentence: string;
    readonly isForcedTranslation: boolean;
    readonly sourceLanguage: string;
    readonly targetLanguage: string;
    readonly translateResult: TranslateResult;
    readonly translationsNumber: number;
    readonly createdDate: Date | string;
    readonly updatedDate: Date | string;
    readonly lastTranslatedDate: Date | string;
    readonly lastModifiedDate: number;
    readonly isStarred: boolean;
    readonly isArchived: boolean;
    readonly tags?: ReadonlyArray<string>;

    readonly syncData?: SyncData[];
}

export interface SyncData {
    readonly userEmail: string;
    readonly serverTimestamp?: string;
    readonly lastModifiedDate?: number;
    readonly serverTranslationsNumber?: number;
}