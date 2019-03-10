import { Component, Prop } from "vue-property-decorator";
import Popper from "popper.js";
import { DropBase } from "../DropBase";

export interface DropItem {
    readonly text: string;
}

export type PositionModifier = "start" | "end";

@Component
export default class DropButton extends DropBase {
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

    @Prop({
        type: Boolean,
        default: false
    })
    public closeBlocked!: boolean;

    public click(): void {
        this.$emit("click");
    }

    public itemClick(item: DropItem) {
        this.$emit("item-click", item);
    }

    public closeDrop(): void {
        if (!this.closeBlocked) {
            super.closeDrop();
        }
    }

    public openDrop(): void {
        this.openDropInternal(this.$refs.dropTarget as Element, this.$refs.dropContent as Element, this.placement, {
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
        });
    }
}