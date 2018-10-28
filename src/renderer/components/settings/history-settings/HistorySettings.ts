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
        interval = interval || 1;
        this.currentHistorySettings.syncInterval = interval * HistorySettings.MillisecondsInSecond * HistorySettings.SecondsInMinutes;
        this.$forceUpdate();
    }

    @Watch("currentHistorySettings", { deep: true })
    public raiseUpdatedEvent(): void {
        this.$emit("history-settings-updated", this.currentHistorySettings);
    }
}