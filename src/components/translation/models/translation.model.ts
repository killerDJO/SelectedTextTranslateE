export interface TranslateDescriptor {
  sentence: string;
  isForcedTranslation: boolean;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslateResult {
  readonly sentence: TranslateResultSentence;
  readonly categories: ReadonlyArray<TranslateResultCategory>;
  readonly definitions: ReadonlyArray<TranslateResultDefinitionCategory>;
  readonly version: string;
}

export interface TranslateResultSentence {
  readonly input: string;
  readonly translation: string | null;
  readonly transcription: string | null;
  readonly origin: string | null;
  readonly suggestion: string | null | undefined;
  readonly languageSuggestion: string | null;
  readonly similarWords?: ReadonlyArray<string>;
}

export interface TranslateResultCategory {
  readonly partOfSpeech: string;
  readonly baseForm: string;
  readonly entries: ReadonlyArray<TranslateResultCategoryEntry>;
}

export interface TranslateResultCategoryEntry {
  readonly word: string;
  readonly reverseTranslations: ReadonlyArray<string>;
  readonly score: number;
}

export interface TranslateResultDefinitionCategory {
  readonly partOfSpeech: string;
  readonly baseForm: string;
  readonly entries: ReadonlyArray<TranslateResultDefinitionCategoryEntry>;
}

export interface TranslateResultDefinitionCategoryEntry {
  readonly definition: string;
  readonly sample: string;
  readonly synonyms: ReadonlyArray<string>;
}
