import { isArray } from "util";

import { TranslateResult } from "./dto/TranslateResult";
import { TranslateResultSentence } from "./dto/TranslateResultSentence";
import { TranslateResultCategory } from "./dto/TranslateResultCategory";
import { TranslateResultCategoryEntry } from "./dto/TranslateResultCategoryEntry";

// Relevant response has the following format
// [
//  [
//      ["<translation>", "<original text>"],
//      [null, null, "<transliteration>"]
//  ],
//  [
//      [
//          "<part_of_speech>",
//          [<irrelevant>],
//          [
//              ["<variant_1>", ["<reverse_translation_1>", "<reverse_translation_2>", ..], null, <score>],
//              ....
//          ],
//          "<base_form>",
//          <irrelevant>
//      ],
//  ],
//  <irrelevant>,
//  <irrelevant>,
//  <irrelevant>,
//  <irrelevant>,
//  <irrelevant>,
//  [<irrelevant>, <suggestion>, <irrelevant>, null, null, <irrelevant>],
// ]
export class TranslationResponseParser {
    public parse(root: any, input: string): TranslateResult {
        const sentence = this.parseSentence(root, input);
        const categories = this.parseTranslateCategories(root);
        return new TranslateResult(sentence, categories);
    }

    private parseSentence(root: any, input: string): TranslateResultSentence {
        let translation: string | null = null;
        let origin: string | null = null;
        const sentenceResponse = root[0][0];
        if (sentenceResponse.length > 0) {
            translation = sentenceResponse[0];
            origin = sentenceResponse[1];
        }

        let suggestion: string | null = null;
        if (!!root[7]) {
            suggestion = root[7][1];
        }

        return new TranslateResultSentence(input, translation, origin, suggestion);
    }

    private parseTranslateCategories(root: any): ReadonlyArray<TranslateResultCategory> {
        if (!isArray(root[1])) {
            return [];
        }

        const categoriesResponse: TranslateResultCategory[] = [];

        for (const categoryResponse of root[1]) {
            const partOfSpeech: string = categoryResponse[0];
            const baseForm: string = categoryResponse[3];
            const categoryEntries: TranslateResultCategoryEntry[] = [];

            if (isArray(categoryResponse[2])) {
                for (const categoryEntryResponse of categoryResponse[2]) {
                    const word: string = categoryEntryResponse[0];
                    const score: number = isFinite(categoryEntryResponse[3]) ? categoryEntryResponse[3] : 0;
                    const reverseTranslations: string[] = [];

                    if (isArray(categoryEntryResponse[1])) {
                        reverseTranslations.push(...categoryEntryResponse[1]);
                    }

                    categoryEntries.push(new TranslateResultCategoryEntry(word, reverseTranslations, score));
                }
            }

            categoriesResponse.push(new TranslateResultCategory(partOfSpeech, baseForm, categoryEntries));
        }

        return categoriesResponse;
    }
}