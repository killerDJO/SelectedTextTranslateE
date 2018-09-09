import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import * as _ from "lodash";

import { EditableScalingSettings } from "common/dto/settings/editable-settings/EditableScalingSettings";
import { ScalingState } from "common/dto/settings/ScalingState";

import SettingsHolder from "components/settings/settings-holder/SettingsHolder.vue";

@Component({
    components: {
        SettingsHolder
    }
})
export default class ScalingSettings extends Vue {
    private static readonly ScalingUpdatedEvent: string = "scaling-settings-updated";
    private static readonly ScalingChangedEvent: string = "scaling-changed";

    @Prop(Object)
    public readonly scalingSettings!: EditableScalingSettings;

    @Prop(Object)
    public readonly scalingState!: ScalingState | null;

    public readonly currentScalingSettings: EditableScalingSettings = _.cloneDeep(this.scalingSettings);

    @Watch("currentScalingSettings", { deep: true })
    public raiseUpdatedEvent(): void {
        this.$emit(ScalingSettings.ScalingUpdatedEvent, this.currentScalingSettings);
    }

    public get scaleFactor(): number {
        if (!this.scalingState) {
            return 0;
        }
        return this.scalingState.scaleFactor * 100;
    }

    public set scaleFactor(value: number) {
        this.$emit(ScalingSettings.ScalingChangedEvent, value / 100);
    }

    public resetScaleFactor() {
        if (!this.scalingState) {
            return;
        }
        this.$emit(ScalingSettings.ScalingChangedEvent, this.scalingState.autoScaleFactor);
    }
}