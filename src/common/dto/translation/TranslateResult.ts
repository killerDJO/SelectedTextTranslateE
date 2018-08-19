import { TranslateResultSentence } from "common/dto/translation/TranslateResultSentence";
import { TranslateResultCategory } from "common/dto/translation/TranslateResultCategory";
import { TranslateResultDefinitionCategory } from "common/dto/translation/TranslateResultDefinitionCategory";

export { TranslateResultSentence } from "common/dto/translation/TranslateResultSentence";
export { TranslateResultCategory } from "common/dto/translation/TranslateResultCategory";
export { TranslateResultCategoryEntry } from "common/dto/translation/TranslateResultCategoryEntry";

export class TranslateResult {
    constructor(
        public readonly sentence: TranslateResultSentence,
        public readonly categories: ReadonlyArray<TranslateResultCategory>,
        public readonly definitions: ReadonlyArray<TranslateResultDefinitionCategory>) {
    }
}
