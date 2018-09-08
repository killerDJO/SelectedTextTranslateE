import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class AppButton extends Vue {
    @Prop(String)
    public text!: string;

    @Prop({
        type: Boolean,
        default: false
    })
    public disabled!: boolean;

    public click(): void {
        this.$emit("click");
    }
}