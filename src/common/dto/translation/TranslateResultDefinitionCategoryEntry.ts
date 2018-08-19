export class TranslateResultDefinitionCategoryEntry {
    constructor(
        private readonly definition: string,
        private readonly sample: string,
        private readonly synonyms: ReadonlyArray<string>
    ) {
    }
}