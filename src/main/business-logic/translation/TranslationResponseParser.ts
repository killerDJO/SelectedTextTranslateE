import { isArray } from "util";
import { injectable } from "inversify";
import * as _ from "lodash";

import { TranslateResult, TranslateResultSentence, TranslateResultCategory, TranslateResultCategoryEntry, TranslateResultDefinitionCategory, TranslateResultDefinitionCategoryEntry } from "common/dto/translation/TranslateResult";

// Relevant response has the following format
// [
// 0:  [
//         ["<translation>", "<original text>"],
//         [null, null, "<transliteration>"]
//     ],
// 1:  [
//         [
//             "<part_of_speech>",
//             [<irrelevant>],
//             [
//                 ["<variant_1>", ["<reverse_translation_1>", "<reverse_translation_2>", ..], null, <score>],
//                 ....
//             ],
//             "<base_form>",
//             <irrelevant>
//         ],
//         ...
//     ],
// 2:  <irrelevant>,
// 3:  <irrelevant>,
// 4:  <irrelevant>,
// 5:  <irrelevant>,
// 6:  <irrelevant>,
// 7:  [<irrelevant>, <suggestion>, <irrelevant>, null, null, <irrelevant>],
// 8:  [[<suggested_language>], <irrelevant>, ...],
// 9:  <irrelevant>,
// 10: <irrelevant>,
// 11: [
//         [
//             "<part_of_speech>",
//             [
//                 [
//                     "<definition_id>",
//                     "<definition_synonyms>"
//                 ],
//                 ....
//             ]
//         ],
//         ....
//     ]
// 12: [
//         [
//             "<part_of_speech>",
//             [
//                 [
//                     "<definition>",
//                     "<definition_id>",
//                     "<sample>"
//                 ],
//                 ....
//             ],
//             "<base_form>"
//         ],
//         ....
//     ]
// ]
@injectable()
export class TranslationResponseParser {

    public parse(root: any, input: string): TranslateResult {
        if (!_.isArray(root)) {
            throw Error("root is not an array");
        }

        const sentence = this.parseSentence(root, input);
        const categories = this.parseTranslateCategories(root);
        const definitions = this.parseDefinitions(root);
        return new TranslateResult(sentence, categories, definitions);
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

        let languageSuggestion: string | null = null;
        if (!!root[8] && !!root[8][0]) {
            languageSuggestion = root[8][0][0] || null;
        }

        return new TranslateResultSentence(input, translation, origin, suggestion, languageSuggestion);
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

    private parseDefinitions(root: any): ReadonlyArray<TranslateResultDefinitionCategory> {
        if (!isArray(root[12])) {
            return [];
        }

        const synonyms = this.parseDefinitionSynonyms(root);

        const definitionCategories: TranslateResultDefinitionCategory[] = [];
        for (const definitionCategory of root[12]) {
            const partOfSpeech: string = definitionCategory[0];
            const baseForm: string = definitionCategory[2];

            const definitionCategoryEntries: TranslateResultDefinitionCategoryEntry[] = [];
            if (isArray(definitionCategory[1])) {
                for (const definitionCategoryEntry of definitionCategory[1]) {
                    const definition = definitionCategoryEntry[0];
                    const id = definitionCategoryEntry[1];
                    const sample = definitionCategoryEntry[2];
                    const categoryEntrySynonyms = synonyms.get(id) || [];
                    definitionCategoryEntries.push(new TranslateResultDefinitionCategoryEntry(definition, sample, categoryEntrySynonyms));
                }
            }

            definitionCategories.push(new TranslateResultDefinitionCategory(partOfSpeech, baseForm, definitionCategoryEntries));
        }

        return definitionCategories;
    }

    private parseDefinitionSynonyms(root: any): Map<string, string[]> {
        const synonyms = new Map<string, string[]>();
        if (!isArray(root[11])) {
            return synonyms;
        }

        for (const definitionCategory of root[11]) {
            if (isArray(definitionCategory[1])) {
                for (const definitionCategoryEntry of definitionCategory[1]) {
                    const categoryEntrySynonyms = definitionCategoryEntry[0];
                    const id = definitionCategoryEntry[1];
                    synonyms.set(id, categoryEntrySynonyms);
                }
            }
        }

        return synonyms;
    }
}