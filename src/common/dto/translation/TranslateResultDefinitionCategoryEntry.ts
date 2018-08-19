export class TranslateResultDefinitionCategoryEntry {
    constructor(
        public readonly definition: string,
        public readonly sample: string,
        public readonly synonyms: ReadonlyArray<string>
    ) {
    }
}