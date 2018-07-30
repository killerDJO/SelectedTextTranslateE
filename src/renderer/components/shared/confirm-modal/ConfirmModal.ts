import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class ConfirmModal extends Vue {

    @Prop(Boolean)
    public show!: boolean;

    public close(): void {
        this.$emit("update:show", false);
    }

    public confirm(): void {
        this.$emit("confirm");
        this.close();
    }
}