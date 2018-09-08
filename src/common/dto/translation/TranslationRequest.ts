export interface TranslationRequest {
    readonly text: string | null;
    readonly isForcedTranslation: boolean;
    readonly sourceLanguage?: string;
    readonly targetLanguage?: string;
    readonly refreshCache: boolean;
}