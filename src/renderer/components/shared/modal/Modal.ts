import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Modal extends Vue {

    @Prop(Boolean)
    public show!: boolean;

    @Prop({
        type: Boolean,
        default: false
    })
    public isActionInProgress!: boolean;

    public get showFooter(): boolean {
        return !!this.$slots.footer && !!this.$slots.footer.length;
    }

    public close(): void {
        if (!this.isActionInProgress) {
            this.$emit("update:show", false);
        }
    }
}