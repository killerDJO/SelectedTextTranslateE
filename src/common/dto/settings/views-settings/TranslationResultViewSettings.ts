import { Hotkey } from "common/dto/settings/Hotkey";

export interface TranslateResultRendererSettings {
    readonly visibility: ResultVisibilitySettings;
    readonly score: ScoreSettings;
    readonly showLoaderDelay: number;
    readonly toggleDefinitionHotkey: Hotkey[];
    readonly archiveResultHotkey: Hotkey[];
    readonly toggleTagsHotkey: Hotkey[];
    readonly addTagHotkey: Hotkey[];
}

export interface ScoreSettings {
    readonly highThreshold: number;
    readonly mediumThreshold: number;
}

export interface ResultVisibilitySettings {
    readonly visibleByDefaultNumber: number;
    readonly lowScoreThreshold: number;
}