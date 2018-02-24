import { TranslateResult } from "common/dto/translation/TranslateResult";

export class DictionaryRecord {
    constructor(
        public readonly sentence: string,
        public readonly isForcedTranslation: boolean,
        public readonly translateResult: TranslateResult,
        public readonly translationsNumber: number,
        public readonly createdDate: Date,
        public readonly updatedDate: Date) {
    }
}