import { Hotkey } from "common/dto/settings/Hotkey";

export interface EditableHotkeySettings {
    readonly translate: Hotkey[];
    readonly playText: Hotkey[];
    readonly zoomIn: Hotkey[];
    readonly zoomOut: Hotkey[];
}