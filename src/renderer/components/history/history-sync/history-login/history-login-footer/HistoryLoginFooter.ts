import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class HistoryLoginFooter extends Vue {
    @Prop(String)
    public confirmText!: string;

    @Prop({
        type: Boolean,
        default: false
    })
    public disabled!: boolean;

    public confirm(): void {
        this.$emit("confirm");
    }

    public close(): void {
        this.$emit("close");
    }
}