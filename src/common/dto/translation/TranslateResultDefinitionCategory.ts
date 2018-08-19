import { TranslateResultDefinitionCategoryEntry } from "common/dto/translation/TranslateResultDefinitionCategoryEntry";

export class TranslateResultDefinitionCategory {
    constructor(
        public readonly partOfSpeech: string,
        public readonly baseForm: string,
        public readonly entries: ReadonlyArray<TranslateResultDefinitionCategoryEntry>,
    ) { }
}