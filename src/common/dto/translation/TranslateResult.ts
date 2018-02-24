import { TranslateResultSentence } from "./TranslateResultSentence";
import { TranslateResultCategory } from "./TranslateResultCategory";

export class TranslateResult {
    constructor(
        public readonly sentence: TranslateResultSentence,
        public readonly categories: ReadonlyArray<TranslateResultCategory>) {
    }
}