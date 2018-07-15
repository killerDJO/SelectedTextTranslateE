import { EditableHotkeySettings } from "common/dto/editable-settings/EditableHotkeySettings";
import { EditableScalingSettings } from "common/dto/editable-settings/EditableScalingSettings";

export interface EditableSettings {
    readonly hotkeys: EditableHotkeySettings;
    readonly scaling: EditableScalingSettings;
}