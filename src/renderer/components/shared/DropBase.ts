import Vue from "vue";
import Popper from "popper.js";

export class DropBase extends Vue {
    private drop: Popper | null = null;
    public isDropContentVisible: boolean = false;

    public get isDropVisible(): boolean {
        return this.drop !== null;
    }

    protected openDropInternal(dropTarget: Element, dropContent: Element, placement: Popper.Placement, modifiers: Popper.Modifiers): void {
        this.isDropContentVisible = true;
        this.drop = new Popper(dropTarget, dropContent, {
            placement: placement,
            positionFixed: false,
            modifiers: {
                computeStyle: {
                    gpuAcceleration: false
                },
                preventOverflow: {
                    boundariesElement: document.querySelector(".view") as Element
                },
                ...modifiers
            }
        });
    }

    public closeDrop(): void {
        this.isDropContentVisible = false;
        if (this.drop !== null) {
            this.drop.destroy();
            this.drop = null;
        }
    }

    public beforeDestroy(): void {
        this.closeDrop();
    }
}