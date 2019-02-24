import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Checkbox extends Vue {
    @Prop(Boolean)
    public value!: boolean;

    @Prop(String)
    public label!: string;

    @Prop({
        type: Boolean,
        default: false
    })
    public leftToRight!: boolean;

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

    public get isChecked$(): boolean {
        return this.value;
    }

    public set isChecked$(isChecked: boolean) {
        this.$emit("input", isChecked);
    }
}