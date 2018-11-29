import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class ToggleButton extends Vue {
    @Prop(String)
    public text!: string;

    @Prop(Boolean)
    public isActive!: boolean;

    public click(): void {
        this.$emit("click");
    }
}