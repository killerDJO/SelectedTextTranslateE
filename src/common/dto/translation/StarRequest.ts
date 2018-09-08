import { TranslationKey } from "common/dto/translation/TranslationKey";

export interface StarRequest extends TranslationKey {
    readonly isStarred: boolean;
}