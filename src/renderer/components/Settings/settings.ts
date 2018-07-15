import { Component, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";

import HotkeySettings from "components/settings/hotkeys-settings/HotkeySettings.vue";
import ScalingSettings from "components/settings/scaling-settings/ScalingSettings.vue";
import { EditableSettings } from "common/dto/editable-settings/EditableSettings";

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

    public readonly SettingsGroup: typeof SettingsGroup = SettingsGroup;
    public currentSettingsGroup: SettingsGroup = SettingsGroup.Scaling;

    public mounted(): void {
        this.setup();
    }

    public isActiveGroup(settingsGroup: SettingsGroup): boolean {
        return this.currentSettingsGroup === settingsGroup;
    }

    public setSettingsGroup(settingsGroup: SettingsGroup): void {
        this.currentSettingsGroup = settingsGroup;
    }
}