import { injectable } from "inversify";
import stripHtml = require("string-strip-html");
import { TranslateResult, TranslateResultSentence, TranslateResultCategory, TranslateResultCategoryEntry, TranslateResultDefinitionCategory, TranslateResultDefinitionCategoryEntry } from "common/dto/translation/TranslateResult";

// tslint:disable no-magic-numbers no-unsafe-any

// Response structure:
// [
// 0: [
//      0: "<transcription>",
//      1: [
//           0: [
//                0: [<..>, <suggested_input>, ..],
//                1: "<original_input>"
//              ],
//           1: ["<suggested_language>"]
//         ],
//         ....
//    ],
// 1: [
//   0: [
//      0: [
//           0: <..>,
//           1: "<transliteration>",
//           2: <..>,
//           3: <..>,
//           4: <..>,
//           5: [
//               0: [
//                    0: "<translation">,
//                       ...
//                  ]
//              ]
//         ]
//      ]
//    ],
// 2: <..>,
// 3: [
//      0: "<base_form>",
//      1: [
//         0: [
//             0: [
//                  0: "<part_of_speech>",
//                  1: [
//                       0: [<definition>", "<sample>", <..>, ["<synonym>", ...]],
//                          ....
//                     ]
//                ]
//            ],
//            ....
//         ],
//      2: <..>,
//      3: <..>,
//      4: [
//           0: [
//                0: [
//                      0: "<part_of_speech>"
//                      1: [
//                            0: [
//                                  0: ["<similar_word>", ...]
//                               ]
//                          ]
//                   ],
//                   ....
//              ]
//         ],
//      5: [
//           0: [
//                 0: [
//                      0: "<part_of_speech">
//                      1: [
//                           0: ["<variant_1>", <...>, ["<reverse_translation_1>", "<reverse_translation_2>", ..], <score>, null]
//                              .....
//                         ]
//                    ],
//                    ...
//               ]
//         ]
//   ]
@injectable()
export class TranslationResponseParser {

    public static readonly Version: string = "v3.1";

    public parse(root: any, input: string): TranslateResult {
        if (!Array.isArray(root)) {
            throw Error("root is not an array");
        }

        const sentence = this.parseSentence(root, input);
        const categories = this.parseTranslateCategories(root);
        const definitions = this.parseDefinitions(root);
        return new TranslateResult(sentence, categories, definitions, TranslationResponseParser.Version);
    }

    private parseSentence(root: any, input: string): TranslateResultSentence {
        const inputResponseSection = root[0];
        const translationResponseSection = root[1];

        let suggestion: string | null = null;
        let origin: string | null = null;
        let languageSuggestion: string | null = null;
        let transcription: string | null = null;
        if (inputResponseSection?.length > 0) {
            origin = inputResponseSection[1]?.[0]?.[1] ?? input;

            const rawSuggestion = inputResponseSection[1]?.[0]?.[0]?.[1];
            suggestion = !!rawSuggestion ? (stripHtml as any).default(rawSuggestion).result : null;

            languageSuggestion = inputResponseSection[1]?.[1]?.[0] ?? null;
            transcription = inputResponseSection[0] ?? null;
        }

        let translation: string | null = null;
        if (translationResponseSection?.length > 0) {
            translation = translationResponseSection[0]?.[0]?.[5]?.[0]?.[0];
        }

        const similarWordsSection = root?.[3]?.[4]?.[0];
        let allSimilarWords: string[] = [];
        if (!!similarWordsSection?.length) {
            for (const similarWordCategory of similarWordsSection) {
                const similarWordSubCategories = similarWordCategory[1];
                if (!!similarWordSubCategories?.length) {
                    for (const similarWordSubCategory of similarWordSubCategories) {
                        const similarWords = similarWordSubCategory?.[0];
                        allSimilarWords = allSimilarWords.concat(similarWords.slice(0, Math.min(similarWords.length, 5)));
                    }
                }
            }
        }

        return new TranslateResultSentence(input, translation, transcription, origin, suggestion, languageSuggestion, allSimilarWords);
    }

    private parseTranslateCategories(root: any): ReadonlyArray<TranslateResultCategory> {
        const categoriesSection = root[3]?.[5]?.[0];
        if (!Array.isArray(categoriesSection)) {
            return [];
        }

        const categoriesResponse: TranslateResultCategory[] = [];

        for (const categoryResponse of categoriesSection) {
            const partOfSpeech: string = categoryResponse[0];
            const baseForm: string = this.getBaseForm(root);
            const categoryEntries: TranslateResultCategoryEntry[] = [];

            if (Array.isArray(categoryResponse[1])) {
                for (const categoryEntryResponse of categoryResponse[1]) {
                    const word: string = categoryEntryResponse[0];
                    const score: number = isFinite(categoryEntryResponse[3]) ? categoryEntryResponse[3] : 0;
                    const reverseTranslations: string[] = [];

                    if (Array.isArray(categoryEntryResponse[2])) {
                        reverseTranslations.push(...categoryEntryResponse[2]);
                    }

                    categoryEntries.push(new TranslateResultCategoryEntry(word, reverseTranslations, score));
                }
            }

            categoriesResponse.push(new TranslateResultCategory(partOfSpeech, baseForm, categoryEntries));
        }

        return categoriesResponse;
    }

    private parseDefinitions(root: any): ReadonlyArray<TranslateResultDefinitionCategory> {
        const definitionsSection = root[3]?.[1]?.[0];
        if (!Array.isArray(definitionsSection)) {
            return [];
        }

        const definitionCategories: TranslateResultDefinitionCategory[] = [];
        for (const definitionCategory of definitionsSection) {
            const partOfSpeech: string = definitionCategory[0];
            const baseForm: string = this.getBaseForm(root);

            const definitionCategoryEntries: TranslateResultDefinitionCategoryEntry[] = [];
            if (Array.isArray(definitionCategory[1])) {
                for (const definitionCategoryEntry of definitionCategory[1]) {
                    const definition = definitionCategoryEntry[0];
                    const sample = definitionCategoryEntry[1];
                    const categoryEntrySynonyms = definitionCategoryEntry[3] || [];
                    definitionCategoryEntries.push(new TranslateResultDefinitionCategoryEntry(definition, sample, categoryEntrySynonyms));
                }
            }

            definitionCategories.push(new TranslateResultDefinitionCategory(partOfSpeech, baseForm, definitionCategoryEntries));
        }

        return definitionCategories;
    }

    private getBaseForm(root: any): string {
        return root[3]?.[0] ?? "N/A";
    }
}