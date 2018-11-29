export interface HistoryFilter {
    readonly starredOnly: boolean;
    readonly includeArchived: boolean;
    readonly word?: string;
    readonly translation?: string;
    readonly minTranslatedTime?: number;
    readonly maxTranslatedTime?: number;
    readonly tags: string[];
    readonly sourceLanguage?: string;
    readonly targetLanguage?: string;
    readonly minLastTranslatedDate?: number;
    readonly maxLastTranslatedDate?: number;
    readonly unsyncedOnly: boolean;
}