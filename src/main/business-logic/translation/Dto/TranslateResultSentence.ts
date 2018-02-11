export class TranslateResultSentence {
    constructor(
        public readonly input: string,
        public readonly translation: string | null,
        public readonly origin: string | null,
        public readonly suggestion: string | null) {
    }
}