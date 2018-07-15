export interface ViewSettings {
    readonly translation: TranslationSettings;
    readonly settings: ViewSize;
    readonly history: ViewSize;
    readonly scaling: Scaling;
}

export interface ViewSize {
    readonly width: number;
    readonly height: number;
}

export interface Scaling {
    verticalResolutionBaseline: number;
    scalingStep: number;
    autoScale: boolean;
    initialScaling: number;
}

export interface TranslationSettings extends ViewSize {
    readonly margin: number;
}