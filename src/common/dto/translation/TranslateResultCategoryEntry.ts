export class TranslateResultCategoryEntry {
    constructor(
        public readonly word: string,
        public readonly reverseTranslations: ReadonlyArray<string>,
        public readonly score: number) {
    }
}