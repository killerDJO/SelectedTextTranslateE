import { stripHtml } from 'string-strip-html';

import type {
  TranslateResult,
  TranslateResultCategory,
  TranslateResultCategoryEntry,
  TranslateResultDefinitionCategory,
  TranslateResultDefinitionCategoryEntry,
  TranslateResultSentence
} from '~/components/translation/models/translation';

// Response structure:
// [
// 0: [
//      0: "<transcription>",
//      1: [
//           0: [
//                0: [<..>, <suggested_input>, ..],
//                1: "<corrected_input>"
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
export class TranslationResponseParser {
  public static readonly Version: string = 'v3.2';

  public parse(root: any, input: string): TranslateResult {
    if (!Array.isArray(root)) {
      throw Error('root is not an array');
    }

    const sentence = this.parseSentence(root, input);
    const categories = this.parseTranslateCategories(root);
    const definitions = this.parseDefinitions(root);
    return {
      sentence,
      categories,
      definitions,
      version: TranslationResponseParser.Version
    };
  }

  private parseSentence(root: any, input: string): TranslateResultSentence {
    const inputResponseSection = root[0];
    const translationResponseSection = root[1];

    let suggestion: string | null = null;
    let origin: string | null = null;
    let languageSuggestion: string | null = null;
    let transcription: string | null = null;
    if (inputResponseSection?.length > 0) {
      const rawSuggestion = inputResponseSection[1]?.[0]?.[0]?.[1];
      suggestion = rawSuggestion ? stripHtml(rawSuggestion).result : null;

      const correctedInput = inputResponseSection[1]?.[0]?.[1];
      origin = !!correctedInput && !!suggestion ? suggestion : input;

      languageSuggestion = inputResponseSection[1]?.[1]?.[0] ?? null;
      transcription = inputResponseSection[0] ?? null;
    }

    let translation: string | null = null;
    if (translationResponseSection?.length > 0) {
      translation = translationResponseSection[0]?.[0]?.[5]?.[0]?.[0];
    }

    const similarWordsSection = root?.[3]?.[4]?.[0];
    let allSimilarWords: string[] = [];
    if (similarWordsSection?.length) {
      for (const similarWordCategory of similarWordsSection) {
        const similarWordSubCategories = similarWordCategory[1];
        if (similarWordSubCategories?.length) {
          for (const similarWordSubCategory of similarWordSubCategories) {
            const similarWords = similarWordSubCategory?.[0];
            allSimilarWords = allSimilarWords.concat(
              similarWords.slice(0, Math.min(similarWords.length, 5))
            );
          }
        }
      }
    }

    return {
      input,
      translation,
      transcription,
      origin,
      suggestion,
      languageSuggestion,
      similarWords: allSimilarWords
    };
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

          categoryEntries.push({ word, reverseTranslations, score });
        }
      }

      categoriesResponse.push({ partOfSpeech, baseForm, entries: categoryEntries });
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
          definitionCategoryEntries.push({ definition, sample, synonyms: categoryEntrySynonyms });
        }
      }

      definitionCategories.push({ partOfSpeech, baseForm, entries: definitionCategoryEntries });
    }

    return definitionCategories;
  }

  private getBaseForm(root: any): string {
    return root[3]?.[0] ?? 'N/A';
  }
}

export const translationResponseParser = new TranslationResponseParser();
