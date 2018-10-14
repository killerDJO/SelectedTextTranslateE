import { Component, Prop, Vue } from "vue-property-decorator";
import Popper, { BaseModifier } from "popper.js";

export interface DropItem {
    readonly text: string;
    callback(): void;
}

@Component
export default class DropButton extends Vue {
    @Prop({
        type: Number,
        default: 0
    })
    public tabIndex!: number;

    @Prop(Array)
    public dropItems!: DropItem[];

    @Prop(String)
    public text!: string;

    private drop: Popper | null = null;
    public isDropVisible: boolean = false;

    public click(): void {
        this.$emit("click");
    }

    public openDrop(): void {
        this.drop = new Popper(this.$refs.dropTarget as Element, this.$refs.dropContent as Element, {
            placement: "bottom-end",
            positionFixed: false,
            modifiers: {
                computeStyle: {
                    gpuAcceleration: false
                },
                preventOverflow: {
                    boundariesElement: document.querySelector(".view") as Element
                }
            }
        });
        this.isDropVisible = true;
    }

    public closeDrop(): void {
        this.isDropVisible = false;

        if (this.drop !== null) {
            this.drop.destroy();
            this.drop = null;
        }
    }

    public processItemClick(callback: () => void) {
        callback();
        this.closeDrop();
    }

    public beforeDestroy(): void {
        this.closeDrop();
    }

    public handleFocusOut(event: FocusEvent): void {
        let isFocusLost = true;
        let element: Element | null = event.relatedTarget as Element;
        while (element !== null) {
            if (this.$refs.dropTarget === element) {
                isFocusLost = false;
                break;
            }
            element = element.parentElement;
        }

        if (isFocusLost) {
            this.closeDrop();
        }
    }
}