import { TranslationKey } from "common/dto/translation/TranslationKey";

export interface MergeRecordsRequest {
    sourceRecord: TranslationKey;
    targetRecord: TranslationKey;
}