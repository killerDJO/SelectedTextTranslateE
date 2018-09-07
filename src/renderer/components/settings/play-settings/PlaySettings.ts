import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import * as _ from "lodash";

import { EditablePlaySettings } from "common/dto/settings/editable-settings/EditablePlaySettings";
import SettingsHolder from "components/settings/settings-holder/SettingsHolder.vue";

@Component({
    components: {
        SettingsHolder
    }
})
export default class ScalingSettings extends Vue {
    @Prop(Object)
    public readonly playSettings!: EditablePlaySettings;

    public readonly currentPlaySettings: EditablePlaySettings = _.cloneDeep(this.playSettings);

    @Watch("currentPlaySettings", { deep: true })
    public raiseUpdatedEvent(): void {
        this.$emit("play-settings-updated", this.currentPlaySettings);
    }
}