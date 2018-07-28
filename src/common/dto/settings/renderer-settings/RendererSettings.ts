import { Hotkey } from "common/dto/settings/Hotkey";

export interface RendererSettings {
    readonly hotkeys: HotkeySettings;
}

export interface HotkeySettings {
    readonly zoomIn: Hotkey[];
    readonly zoomOut: Hotkey[];
    readonly resetZoom: Hotkey[];
}
