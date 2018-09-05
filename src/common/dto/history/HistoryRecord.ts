import { TranslateResult } from "common/dto/translation/TranslateResult";

export interface HistoryRecord {
    readonly sentence: string;
    readonly isForcedTranslation: boolean;
    readonly translateResult: TranslateResult;
    readonly translationsNumber: number;
    readonly createdDate: Date;
    readonly updatedDate: Date;
    readonly lastTranslatedDate: Date;
    readonly isStarred: boolean;
}