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

    public get isChecked$(): boolean {
        return this.value;
    }

    public set isChecked$(isChecked: boolean) {
        this.$emit("input", isChecked);
    }

    public onClick(): void {
        this.isChecked$ = !this.isChecked$;
    }
}