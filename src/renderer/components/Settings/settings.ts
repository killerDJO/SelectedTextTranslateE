import { Component, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
import * as _ from "lodash";

import HotkeySettings from "components/settings/hotkeys-settings/HotkeySettings.vue";
import ScalingSettings from "components/settings/scaling-settings/ScalingSettings.vue";
import { EditableSettings } from "common/dto/settings/editable-settings/EditableSettings";
import { EditableHotkeySettings } from "common/dto/settings/editable-settings/EditableHotkeySettings";
import { EditableScalingSettings } from "common/dto/settings/editable-settings/EditableScalingSettings";
import { ScalingState } from "common/dto/settings/ScalingState";

const ns = namespace("app/settings");

@Component({
    components: {
        HotkeySettings,
        ScalingSettings
    }
})
export default class Settings extends Vue {
    @ns.State public settings!: EditableSettings | null;
    @ns.State public scalingState!: ScalingState | null;

    @ns.Action private readonly setup!: () => void;
    @ns.Action private readonly updateSettings!: (settings: EditableSettings) => void;
    @ns.Action public readonly pauseHotkeys!: () => void;
    @ns.Action public readonly enableHotkeys!: () => void;

    @ns.Action public readonly changeScaling!: (scaleFactor: number) => void;

    public mounted(): void {
        this.setup();
    }

    public updateHotkeySettings(hotkeySettings: EditableHotkeySettings): void {
        this.updateEditableSettings(settings => settings.hotkeys = hotkeySettings);
    }

    public updateScalingSettings(scalingSettings: EditableScalingSettings): void {
        this.updateEditableSettings(settings => settings.scaling = scalingSettings);
    }

    private updateEditableSettings(settingsSetting: (settings: EditableSettings) => void): void {
        if (!this.settings) {
            return;
        }

        const updatedSettings = _.cloneDeep(this.settings);
        settingsSetting(updatedSettings);
        this.updateSettings(updatedSettings);
    }
}