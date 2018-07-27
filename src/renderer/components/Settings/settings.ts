import { Component, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
import * as _ from "lodash";

import HotkeySettings from "components/settings/hotkeys-settings/HotkeySettings.vue";
import ScalingSettings from "components/settings/scaling-settings/ScalingSettings.vue";
import { EditableSettings } from "common/dto/settings/editable-settings/EditableSettings";
import { EditableHotkeySettings } from "common/dto/settings/editable-settings/EditableHotkeySettings";

enum SettingsGroup {
    Scaling = 1,
    Hotkeys = 2
}

const ns = namespace("app/settings");

@Component({
    components: {
        HotkeySettings,
        ScalingSettings
    }
})
export default class Settings extends Vue {
    @ns.State public settings!: EditableSettings | null;

    @ns.Action private readonly setup!: () => void;
    @ns.Action private readonly pauseHotkeys!: () => void;
    @ns.Action private readonly enableHotkeys!: () => void;
    @ns.Action private readonly updateSettings!: (settings: EditableSettings) => void;

    public readonly SettingsGroup: typeof SettingsGroup = SettingsGroup;
    public currentSettingsGroup: SettingsGroup = SettingsGroup.Hotkeys;

    public mounted(): void {
        this.setup();
    }

    public isActiveGroup(settingsGroup: SettingsGroup): boolean {
        return this.currentSettingsGroup === settingsGroup;
    }

    public setSettingsGroup(settingsGroup: SettingsGroup): void {
        this.currentSettingsGroup = settingsGroup;
    }

    public updateHotkeySettings(hotkeySettings: EditableHotkeySettings): void {
        if (!this.settings) {
            return;
        }

        const updatedSettings = _.cloneDeep(this.settings);
        updatedSettings.hotkeys = hotkeySettings;
        this.updateSettings(updatedSettings);
    }

    public hotkeyInputStarted(): void {
        this.pauseHotkeys();
    }

    public hotkeyInputCompleted(): void {
        this.enableHotkeys();
    }
}