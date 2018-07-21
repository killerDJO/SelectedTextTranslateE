import { EditableHotkeySettings } from "common/dto/settings/editable-settings/EditableHotkeySettings";
import { EditableScalingSettings } from "common/dto/settings/editable-settings/EditableScalingSettings";

export interface EditableSettings {
    readonly hotkeys: EditableHotkeySettings;
    readonly scaling: EditableScalingSettings;
}