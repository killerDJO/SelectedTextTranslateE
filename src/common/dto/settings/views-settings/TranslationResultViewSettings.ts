export interface TranslationViewRendererSettings {
    readonly visibility: ResultVisibilitySettings;
    readonly score: ScoreSettings;
    readonly showLoaderDelay: number;
}

export interface ScoreSettings {
    readonly highThreshold: number;
    readonly mediumThreshold: number;
}

export interface ResultVisibilitySettings {
    readonly visibleByDefaultNumber: number;
    readonly lowScoreThreshold: number;
}