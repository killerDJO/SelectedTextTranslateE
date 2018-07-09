import { TranslateResultCategoryEntry } from "common/dto/translation/TranslateResultCategoryEntry";

export class TranslateResultCategory {
    constructor(
        public readonly partOfSpeech: string,
        public readonly baseForm: string,
        public readonly entries: ReadonlyArray<TranslateResultCategoryEntry>) {
    }
}