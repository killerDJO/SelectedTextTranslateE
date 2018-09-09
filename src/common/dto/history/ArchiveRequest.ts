import { TranslationKey } from "common/dto/translation/TranslationKey";

export interface ArchiveRequest extends TranslationKey {
    readonly isArchived: boolean;
}