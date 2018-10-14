import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Modal extends Vue {

    @Prop(Boolean)
    public show!: boolean;

    @Prop({
        type: String,
        default: "Confirm"
    })
    public confirmText!: string;

    public close(): void {
        this.$emit("update:show", false);
    }

    public confirm(): void {
        this.$emit("confirm");
        this.close();
    }
}