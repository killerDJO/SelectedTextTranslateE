import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class IconButton extends Vue {
    @Prop({
        type: String,
        default: ""
    })
    public title!: string;

    @Prop({
        type: Boolean,
        default: false
    })
    public disabled!: boolean;

    @Prop({
        type: Number,
        default: 0
    })
    public tabIndex!: number;

    public click(): void {
        if (!this.disabled) {
            this.$emit("click");
        }
    }
}