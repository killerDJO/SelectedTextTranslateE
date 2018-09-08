export class TranslateResult {
    constructor(
        public readonly sentence: TranslateResultSentence,
        public readonly categories: ReadonlyArray<TranslateResultCategory>,
        public readonly definitions: ReadonlyArray<TranslateResultDefinitionCategory>) {
    }
}

export class TranslateResultSentence {
    constructor(
        public readonly input: string,
        public readonly translation: string | null,
        public readonly origin: string | null,
        public readonly suggestion: string | null,
        public readonly languageSuggestion: string | null) {
    }
}

export class TranslateResultCategory {
    constructor(
        public readonly partOfSpeech: string,
        public readonly baseForm: string,
        public readonly entries: ReadonlyArray<TranslateResultCategoryEntry>) {
    }
}

export class TranslateResultCategoryEntry {
    constructor(
        public readonly word: string,
        public readonly reverseTranslations: ReadonlyArray<string>,
        public readonly score: number) {
    }
}

export class TranslateResultDefinitionCategory {
    constructor(
        public readonly partOfSpeech: string,
        public readonly baseForm: string,
        public readonly entries: ReadonlyArray<TranslateResultDefinitionCategoryEntry>) {
    }
}

export class TranslateResultDefinitionCategoryEntry {
    constructor(
        public readonly definition: string,
        public readonly sample: string,
        public readonly synonyms: ReadonlyArray<string>) {
    }
}