import { TranslateResult } from "common/dto/translation/TranslateResult";
import { TranslationKey } from "common/dto/translation/TranslationKey";

export interface HistoryRecord extends TranslationKey {
    readonly id: string;
    readonly translateResult: TranslateResult;
    readonly translationsNumber: number;
    readonly createdDate: number;
    readonly updatedDate: number;
    readonly lastTranslatedDate: number;
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
    readonly serverTags?: ReadonlyArray<string>;
}