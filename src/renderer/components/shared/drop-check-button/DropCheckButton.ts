import { Component, Prop, Vue } from "vue-property-decorator";

import DropButtonView, { DropItem, PositionModifier } from "../drop-button/DropButton";
import DropButton from "components/shared/drop-button/DropButton.vue";

export interface DropCheckItem extends DropItem {
    isChecked: boolean;
    isDisabled: boolean;
}

@Component({
    components: {
        DropButton
    }
})
export default class DropCheckButton extends Vue {
    @Prop({
        type: Number,
        default: 0
    })
    public tabIndex!: number;

    @Prop(Array)
    public items!: DropCheckItem[];

    @Prop(String)
    public text!: string;

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

    public click(): void {
        this.toggleDrop();
        this.$emit("click");
    }

    public itemClick(item: DropCheckItem) {
        if (!item.isDisabled) {
            item.isChecked = !item.isChecked;
        }
    }

    public getDropButton(): DropButtonView {
        return this.$refs.dropButton as DropButtonView;
    }

    public toggleDrop(): void {
        const drop = this.getDropButton();
        if (drop.isDropVisible) {
            drop.closeDrop();
        } else {
            drop.openDrop();
        }
    }
}