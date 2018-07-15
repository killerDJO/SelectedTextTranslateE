import { Component, Prop, Vue } from "vue-property-decorator";
import { EditableHotkeySettings } from "common/dto/editable-settings/EditableHotkeySettings";

@Component
export default class HotkeySettings extends Vue {
    @Prop(Object)
    public readonly hotkeySettings!: EditableHotkeySettings;
}