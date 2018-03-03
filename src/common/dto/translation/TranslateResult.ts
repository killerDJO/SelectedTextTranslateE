import { TranslateResultSentence } from "./TranslateResultSentence";
import { TranslateResultCategory } from "./TranslateResultCategory";

export { TranslateResultSentence } from "./TranslateResultSentence";
export { TranslateResultCategory } from "./TranslateResultCategory";
export { TranslateResultCategoryEntry } from "./TranslateResultCategoryEntry";

export class TranslateResult {
    constructor(
        public readonly sentence: TranslateResultSentence,
        public readonly categories: ReadonlyArray<TranslateResultCategory>) {
    }
}
