import { Component, Prop, Vue } from "vue-property-decorator";

import DropButtonView, { DropItem, PositionModifier } from "../drop-button/DropButton";
import DropButton from "components/shared/drop-button/DropButton.vue";

export interface DropListItem extends DropItem {
    text: string;
    callback(): void;
}

@Component({
    components: {
        DropButton
    }
})
export default class DropListButton extends Vue {
    @Prop({
        type: Number,
        default: 0
    })
    public tabIndex!: number;

    @Prop(Array)
    public items!: DropListItem[];

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
        this.closeDrop();
        this.$emit("click");
    }

    public itemClick(item: DropListItem) {
        item.callback();
        this.closeDrop();
    }

    public getDropButton(): DropButtonView {
        return this.$refs.dropButton as DropButtonView;
    }

    public closeDrop(): void {
        this.getDropButton().closeDrop();
    }
}