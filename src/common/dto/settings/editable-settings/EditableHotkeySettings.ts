import { Hotkey } from "common/dto/settings/Hotkey";

export interface EditableHotkeySettings {
    readonly global: GlobalHotkeySettings;
    readonly local: LocalHotkeySettings;
}

export interface GlobalHotkeySettings {
    readonly translate: Hotkey[];
    readonly playText: Hotkey[];
}

export interface LocalHotkeySettings {
    readonly zoomIn: Hotkey[];
    readonly zoomOut: Hotkey[];
    readonly resetZoom: Hotkey[];
}