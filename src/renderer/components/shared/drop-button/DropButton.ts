import { Component, Prop, Vue } from "vue-property-decorator";
import Popper from "popper.js";

export interface DropItem {
    readonly text: string;
}

export type PositionModifier = "start" | "end";

@Component
export default class DropButton extends Vue {
    @Prop({
        type: Number,
        default: 0
    })
    public tabIndex!: number;

    @Prop(Array)
    public items!: DropItem[];

    @Prop(String)
    public text!: string;

    @Prop({
        type: String,
        default: "bottom"
    })
    public placement!: Popper.Position;

    @Prop({
        type: String,
        default: "end"
    })
    public overflowPosition!: PositionModifier;

    @Prop({
        type: String,
        default: "end"
    })
    public preferredPosition!: PositionModifier;

    private drop: Popper | null = null;
    public isDropVisible: boolean = false;

    public click(): void {
        this.$emit("click");
    }

    public itemClick(item: DropItem) {
        this.$emit("item-click", item);
    }

    public openDrop(): void {
        this.drop = new Popper(this.$refs.dropTarget as Element, this.$refs.dropContent as Element, {
            placement: this.placement,
            positionFixed: false,
            modifiers: {
                computeStyle: {
                    gpuAcceleration: false
                },
                shift: {
                    fn: (data, options) => {
                        if (data.placement === this.placement) {
                            data.placement = (data.offsets.popper.width > data.offsets.reference.width ? `${this.placement}-${this.overflowPosition}` : `${this.placement}-${this.preferredPosition}`) as Popper.Placement;
                        }

                        if (!!Popper.Defaults.modifiers && !!Popper.Defaults.modifiers.shift && Popper.Defaults.modifiers.shift.fn) {
                            return Popper.Defaults.modifiers.shift.fn(data, options);
                        }

                        return data;
                    }
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

    public beforeDestroy(): void {
        this.closeDrop();
    }
}