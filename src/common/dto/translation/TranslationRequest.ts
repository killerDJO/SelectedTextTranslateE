export interface TranslationRequest {
    readonly text: string | null;
    readonly isForcedTranslation: boolean;
    readonly refreshCache: boolean;
}