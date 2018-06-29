export interface PresentationSettings {
    readonly visibility: ResultVisibilitySettings;
    readonly score: ScoreSettings;
}

export interface ScoreSettings {
    readonly highThreshold: number;
    readonly mediumThreshold: number;
}

export interface ResultVisibilitySettings {
    readonly visibleByDefaultNumber: number;
    readonly lowScoreThreshold: number;
}