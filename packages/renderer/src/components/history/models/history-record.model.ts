import type {
  TranslateResult,
  TranslateDescriptor
} from '~/components/translation/models/translation.model';

export interface TranslationInstance {
  readonly translationDate: number;
  readonly tags: ReadonlyArray<string>;
}

export interface HistoryRecord extends TranslateDescriptor {
  readonly id: string;
  readonly translateResult: TranslateResult;
  readonly translationsNumber: number;
  readonly createdDate: number;
  readonly updatedDate: number;
  readonly lastTranslatedDate: number;
  readonly lastModifiedDate: number;
  readonly isStarred: boolean;
  readonly isArchived: boolean;
  readonly tags?: ReadonlyArray<string>;
  readonly blacklistedMergeRecords?: ReadonlyArray<string>;
  readonly user: string;
  readonly instances?: ReadonlyArray<TranslationInstance>;
}
