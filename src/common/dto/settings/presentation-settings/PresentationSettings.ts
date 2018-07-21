import { Hotkey } from "../Hotkey";

export interface PresentationSettings {
    readonly visibility: ResultVisibilitySettings;
    readonly score: ScoreSettings;
    readonly hotkeys: PresentationHotkeySettings;
}

export interface ScoreSettings {
    readonly highThreshold: number;
    readonly mediumThreshold: number;
}

export interface ResultVisibilitySettings {
    readonly visibleByDefaultNumber: number;
    readonly lowScoreThreshold: number;
}

export interface PresentationHotkeySettings {
    readonly zoomIn: Hotkey[];
    readonly zoomOut: Hotkey[];
}