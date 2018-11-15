import { Component, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import * as _ from "lodash";

import { EditableSettings } from "common/dto/settings/editable-settings/EditableSettings";
import { EditableHotkeySettings } from "common/dto/settings/editable-settings/EditableHotkeySettings";
import { EditableScalingSettings } from "common/dto/settings/editable-settings/EditableScalingSettings";
import { EditablePlaySettings } from "common/dto/settings/editable-settings/EditablePlaySettings";
import { EditableLanguageSettings } from "common/dto/settings/editable-settings/EditableLanguageSettings";
import { EditableHistorySettings } from "common/dto/settings/editable-settings/EditableHistorySettings";
import { ScalingState } from "common/dto/settings/ScalingState";
import { SettingsGroup } from "common/dto/settings/SettingsGroup";

import SettingsHolder from "components/settings/settings-holder/SettingsHolder.vue";
import HotkeySettings from "components/settings/hotkeys-settings/HotkeySettings.vue";
import ScalingSettings from "components/settings/scaling-settings/ScalingSettings.vue";
import PlaySettings from "components/settings/play-settings/PlaySettings.vue";
import LanguageSettings from "components/settings/language-settings/LanguageSettings.vue";
import StartupSettings from "components/settings/startup-settings/StartupSettings.vue";
import HistorySettings from "components/settings/history-settings/HistorySettings.vue";

const ns = namespace("app/settings");

@Component({
    components: {
        SettingsHolder,
        HotkeySettings,
        ScalingSettings,
        PlaySettings,
        LanguageSettings,
        StartupSettings,
        HistorySettings
    }
})
export default class Settings extends Vue {
    @ns.State public settings!: EditableSettings | null;
    @ns.State public defaultSettings!: EditableSettings | null;
    @ns.State public scalingState!: ScalingState | null;
    @ns.State public isStartupEnabled!: boolean;
    @ns.State public currentSettingsGroup!: SettingsGroup | null;

    @ns.Action private readonly setup!: () => void;
    @ns.Action private readonly updateSettings!: (settings: EditableSettings) => void;
    @ns.Action public readonly pauseHotkeys!: () => void;
    @ns.Action public readonly enableHotkeys!: () => void;
    @ns.Action public readonly openSettingsFile!: () => void;
    @ns.Action public readonly setStartupState!: (isStartupEnabled: boolean) => void;

    @ns.Action public readonly changeScaling!: (scaleFactor: number) => void;

    public readonly settingsGroupToElementMap: { [key: string]: HTMLElement } = {};
    public readonly SettingsGroup: typeof SettingsGroup = SettingsGroup;

    public mounted(): void {
        this.setup();
    }

    public updateHotkeySettings(hotkeySettings: EditableHotkeySettings): void {
        this.updateEditableSettings(settings => settings.hotkeys = hotkeySettings);
    }

    public updateScalingSettings(scalingSettings: EditableScalingSettings): void {
        this.updateEditableSettings(settings => settings.scaling = scalingSettings);
    }

    public updatePlaySettings(playSettings: EditablePlaySettings): void {
        this.updateEditableSettings(settings => settings.play = playSettings);
    }

    public updateLanguageSettings(languageSettings: EditableLanguageSettings): void {
        this.updateEditableSettings(settings => settings.language = languageSettings);
    }

    public updateHistorySettings(historySettings: EditableHistorySettings): void {
        this.updateEditableSettings(settings => settings.history = historySettings);
    }

    @Watch("currentSettingsGroup")
    public onCurrentSettingsGroupChanged(): void {
        if (this.currentSettingsGroup !== null) {
            const currentGroupElement = this.$refs[this.currentSettingsGroup];
            if (currentGroupElement instanceof Vue) {
                (currentGroupElement as Vue).$el.scrollIntoView();
            }
        }
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