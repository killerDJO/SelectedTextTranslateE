import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class SettingsHolder extends Vue {

    @Prop(String)
    public readonly title!: boolean;

    public isExpanded: boolean = true;

    public toggleExpandedState(): void {
        this.isExpanded = !this.isExpanded;
    }
}