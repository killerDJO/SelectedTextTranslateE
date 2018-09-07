import { EditableHotkeySettings } from "common/dto/settings/editable-settings/EditableHotkeySettings";
import { EditableScalingSettings } from "common/dto/settings/editable-settings/EditableScalingSettings";
import { EditablePlaySettings } from "common/dto/settings/editable-settings/EditablePlaySettings";

export interface EditableSettings {
    hotkeys: EditableHotkeySettings;
    scaling: EditableScalingSettings;
    play: EditablePlaySettings;
}