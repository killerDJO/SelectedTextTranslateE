import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import * as _ from "lodash";

import { ColumnSettings } from "common/dto/settings/views-settings/HistoryViewSettings";
import { SortColumn } from "common/dto/history/SortColumn";

import { ColumnNameResolver } from "components/history/ColumnNameResolver";
import DropButtonView, { PositionModifier, DropItem } from "components/shared/drop-button/DropButton";
import DropButton from "components/shared/drop-button/DropButton.vue";

interface ColumnDropItem extends DropItem {
    readonly column: SortColumn;
    weight: number;
    isChecked: boolean;
    isDisabled: boolean;
}

@Component({
    components: {
        DropButton
    }
})
export default class ColumnsEditor extends Vue {
    private readonly columnNameResolver: ColumnNameResolver = new ColumnNameResolver();

    @Prop(Array) public columns!: ReadonlyArray<ColumnSettings>;

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

    public items: ReadonlyArray<ColumnDropItem> = [];
    public closeBlocked: boolean = false;

    @Watch("columns", { deep: true, immediate: true })
    public buildItems(): void {
        this.items = this.columns.map(columnSetting => ({
            column: columnSetting.column,
            text: this.columnNameResolver.getColumnName(columnSetting.column),
            isChecked: columnSetting.isVisible,
            weight: columnSetting.weight,
            isDisabled: false
        }));
    }

    @Watch("items", { deep: true })
    public onItemsChanged() {
        this.setColumnSettingsDisabledState();

        const updatedItems: ColumnSettings[] = this.mapItems(this.items);

        if (!_.isEqual(this.columns, updatedItems)) {
            this.$emit("update-columns", updatedItems);
        }
    }

    public itemClick(item: ColumnDropItem) {
        if (!item.isDisabled) {
            item.isChecked = !item.isChecked;
        }
    }

    public toggleDrop(): void {
        const drop = this.$refs.dropButton as DropButtonView;
        if (drop.isDropVisible) {
            drop.closeDrop();
        } else {
            drop.openDrop();
        }
    }

    public moveUp(item: ColumnDropItem): void {
        if (!this.isMoveUpEnabled(item)) {
            return;
        }

        this.moveItem(item, itemIndex => itemIndex - 1);
    }

    public moveDown(item: ColumnDropItem): void {
        if (!this.isMoveDownEnabled(item)) {
            return;
        }

        this.moveItem(item, itemIndex => itemIndex + 1);
    }

    public isMoveUpEnabled(item: ColumnDropItem): boolean {
        return this.items.indexOf(item) > 0;
    }

    public isMoveDownEnabled(item: ColumnDropItem): boolean {
        return this.items.indexOf(item) < this.items.length - 1;
    }

    private moveItem(item: ColumnDropItem, nextIndexGenerator: (index: number) => number): void {
        this.closeBlocked = true;

        const itemIndex = this.items.indexOf(item);
        const clonedItems = this.items.slice();
        const swap = clonedItems[itemIndex];

        const nextIndex = nextIndexGenerator(itemIndex);
        clonedItems[itemIndex] = clonedItems[nextIndex];
        clonedItems[nextIndex] = swap;
        this.$emit("update-columns", this.mapItems(clonedItems));

        // Hack: drop loses focus after re-render, prevent close until this
        setTimeout(() => this.closeBlocked = false, 100);
    }

    private mapItems(items: ReadonlyArray<ColumnDropItem>): ColumnSettings[] {
        return items.map(setting => ({
            column: setting.column,
            isVisible: setting.isChecked,
            weight: setting.weight
        }));
    }

    private setColumnSettingsDisabledState(): void {
        const numberOfHiddenColumns = this.items.filter(setting => !setting.isChecked).length;
        const shouldDisableColumnsHide = numberOfHiddenColumns >= (this.items.length - 1);
        this.items.forEach(item => item.isDisabled = item.isChecked && shouldDisableColumnsHide);
    }
}