import { Hotkey } from "common/dto/settings/Hotkey";

export interface TranslateResultRendererSettings {
    readonly visibility: ResultVisibilitySettings;
    readonly showLoaderDelay: number;
    readonly toggleDefinitionHotkey: Hotkey[];
    readonly archiveResultHotkey: Hotkey[];
    readonly toggleTagsHotkey: Hotkey[];
    readonly addTagHotkey: Hotkey[];
}

export interface ResultVisibilitySettings {
    readonly visibleByDefaultNumber: number;
}