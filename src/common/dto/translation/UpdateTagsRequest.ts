import { TranslationKey } from "common/dto/translation/TranslationKey";

export interface UpdateTagsRequest extends TranslationKey {
    readonly tags: ReadonlyArray<string>;
}