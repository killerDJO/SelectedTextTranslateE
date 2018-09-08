import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class LinkButton extends Vue {
    @Prop(String)
    public text!: string;

    @Prop({
        type: Number,
        default: 0
    })
    public tabIndex!: number;

    public click(): void {
        this.$emit("click");
    }
}