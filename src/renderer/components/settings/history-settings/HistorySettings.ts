import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import * as _ from "lodash";

import { EditableHistorySettings } from "common/dto/settings/editable-settings/EditableHistorySettings";

import SettingsHolder from "components/settings/settings-holder/SettingsHolder.vue";

@Component({
    components: {
        SettingsHolder
    }
})
export default class HistorySettings extends Vue {
    @Prop(Object)
    public readonly historySettings!: EditableHistorySettings;

    public readonly currentHistorySettings: EditableHistorySettings = _.cloneDeep(this.historySettings);

    private static readonly SecondsInMinutes: number = 60;
    private static readonly MillisecondsInSecond: number = 1000;

    public get syncIntervalMinutes(): number {
        return Math.round(this.currentHistorySettings.syncInterval / HistorySettings.MillisecondsInSecond / HistorySettings.SecondsInMinutes);
    }

    public set syncIntervalMinutes(interval: number) {
        this.currentHistorySettings.syncInterval = this.ensureMinValue(interval, 1) * HistorySettings.MillisecondsInSecond * HistorySettings.SecondsInMinutes;
        this.$forceUpdate();
    }

    public get numberOfStartupBackupsToKeep(): number {
        return this.currentHistorySettings.backupOnApplicationStartNumberToKeep;
    }

    public set numberOfStartupBackupsToKeep(numberOfBackups: number) {
        this.currentHistorySettings.backupOnApplicationStartNumberToKeep = this.ensureMinValue(numberOfBackups, 0);
        this.$forceUpdate();
    }

    public get numberOfRegularBackupsToKeep(): number {
        return this.currentHistorySettings.backupRegularlyNumberToKeep;
    }

    public set numberOfRegularBackupsToKeep(numberOfBackups: number) {
        this.currentHistorySettings.backupRegularlyNumberToKeep = this.ensureMinValue(numberOfBackups, 0);
        this.$forceUpdate();
    }

    public get backupRegularlyIntervalDays(): number {
        return this.currentHistorySettings.backupRegularlyIntervalDays;
    }

    public set backupRegularlyIntervalDays(interval: number) {
        this.currentHistorySettings.backupRegularlyIntervalDays = this.ensureMinValue(interval, 1);
        this.$forceUpdate();
    }

    @Watch("currentHistorySettings", { deep: true })
    public raiseUpdatedEvent(): void {
        this.$emit("history-settings-updated", this.currentHistorySettings);
    }

    private ensureMinValue(value: number, minValue: number): number {
        return Math.max(value, minValue);
    }
}