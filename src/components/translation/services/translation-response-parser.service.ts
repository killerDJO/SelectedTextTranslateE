/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  TranslateResult,
  TranslateResultCategory,
  TranslateResultCategoryEntry,
  TranslateResultDefinitionCategory,
  TranslateResultDefinitionCategoryEntry,
  TranslateResultSentence
} from '~/components/translation/models/translation.model';

// Response structure:
// [
// 0: [
//      0: "<transcription>",
//      1: [
//           0: [
//                0: [<..>, <suggested_input_as_html>, ..],
//                1: "<corrected_input>"
//              ],
//           1: ["<suggested_language>"],
//           2: <..>,
//           3: <..>,
//           4: "<suggested_input>"
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
//                  0: <..>,
//                  1: [
//                       0: [
//                            0: "<definition>",
//                            1: "<sample>",
//                            2: <..>,
//                            3: <..>,
//                            4: <..>,
//                            5: [
//                              0: [[["<synonym_1>"], ["<synonym_2>"], ...]]]
//                            ]
//                          ]
//                     ],
//                  2: <..>,
//                  3: <part_of_speech>
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
//                      0: null,
//                      1: [
//                           0: ["<variant_1>", <...>, ["<reverse_translation_1>", "<reverse_translation_2>", ..], <score>, null]
//                              .....
//                         ],
//                      2: ...,
//                      3: ...,
//                      4: <part_of_speech>,
//                    ],
//                    ...
//               ]
//         ]
//   ]
export class TranslationResponseParser {
  public static readonly Version: string = 'v3.6';

  public parse(root: any, input: string): TranslateResult {
    if (!Array.isArray(root)) {
      throw Error('root is not an array');
    }

    const sentence = this.parseSentence(root, input);
    const categories = this.parseTranslateCategories(root);
    const definitions = this.parseDefinitions(root);

    // Since response isn't always accurate, use top category result if available
    const fixedSentence: TranslateResultSentence = {
      ...sentence,
      translation: categories[0]?.entries?.[0]?.word ?? sentence.translation
    };

    return {
      sentence: fixedSentence,
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
      suggestion = inputResponseSection[1]?.[0]?.[4];

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
      const partOfSpeech: string = this.mapPartOfSpeech(categoryResponse[4] ?? 0);
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
      const partOfSpeech: string = this.mapPartOfSpeech(definitionCategory[3]);
      const baseForm: string = this.getBaseForm(root);

      const definitionCategoryEntries: TranslateResultDefinitionCategoryEntry[] = [];
      if (Array.isArray(definitionCategory[1])) {
        for (const definitionCategoryEntry of definitionCategory[1]) {
          const definition = definitionCategoryEntry[0];
          const sample = definitionCategoryEntry[1];
          const categoryEntrySynonyms =
            definitionCategoryEntry[5]?.[0]?.[0].map((entry: any) => entry?.[0]?.toString()) || [];
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

  private mapPartOfSpeech(index: number): string {
    const indexToPartOfSpeechMap: Record<number, string> = {
      1: 'Noun',
      2: 'Verb',
      3: 'Adjective',
      4: 'Adverb',
      5: 'Preposition',
      6: 'Abbreviation',
      7: 'Conjunction',
      8: 'Pronoun',
      9: 'Interjection',
      10: 'Phrase',
      11: 'Prefix',
      12: 'Suffix',
      13: 'Article',
      14: 'Combining form',
      15: 'Numeral',
      16: 'Auxiliary verb',
      17: 'Exclamation',
      18: 'Plural',
      19: 'Particle'
    };

    return indexToPartOfSpeechMap[index] ?? index.toString();
  }
}

export const translationResponseParser = new TranslationResponseParser();
