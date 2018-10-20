import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class ConfirmModal extends Vue {

    @Prop(Boolean)
    public show!: boolean;

    @Prop({
        type: String,
        default: "Confirm"
    })
    public confirmText!: string;

    public get show$(): boolean {
        return this.show;
    }

    public set show$(show: boolean) {
        this.$emit("update:show", show);
    }

    public close(): void {
        this.show$ = false;
    }

    public confirm(): void {
        this.$emit("confirm");
        this.close();
    }
}