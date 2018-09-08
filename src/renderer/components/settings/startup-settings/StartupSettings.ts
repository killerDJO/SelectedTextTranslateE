import { Component, Vue, Prop } from "vue-property-decorator";

import SettingsHolder from "components/settings/settings-holder/SettingsHolder.vue";

@Component({
    components: {
        SettingsHolder
    }
})
export default class StartupSettings extends Vue {
    @Prop(Boolean)
    public readonly isStartupEnabled!: boolean;

    public get startupState(): boolean {
        return this.isStartupEnabled;
    }

    public set startupState(isStartupEnabled: boolean) {
        this.$emit("set-startup-state", isStartupEnabled);
    }
}