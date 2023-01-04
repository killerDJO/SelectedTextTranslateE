export interface HistoryFilter {
  starredOnly: boolean;
  includeArchived: boolean;
  word?: string;
  translation?: string;
  minTranslatedTime?: number;
  maxTranslatedTime?: number;
  tags?: string[];
  sourceLanguage?: string;
  targetLanguage?: string;
  minLastTranslatedDate?: Date;
  maxLastTranslatedDate?: Date;
}
