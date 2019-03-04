import { Component, Vue, Prop } from "vue-property-decorator";

import { SortOrder } from "common/dto/history/SortOrder";
import { SortColumn } from "common/dto/history/SortColumn";

import { ColumnNameResolver } from "components/history/ColumnNameResolver";

@Component
export default class SortableHeader extends Vue {

    public readonly columnNameResolver: ColumnNameResolver = new ColumnNameResolver();

    @Prop()
    public sortColumn!: SortColumn;

    @Prop()
    public currentSortOrder!: SortOrder;

    @Prop()
    public currentSortColumn!: SortColumn;

    public SortOrder: typeof SortOrder = SortOrder;

    public isSortArrowHidden(sortOrder: SortOrder): boolean {
        return this.sortColumn === this.currentSortColumn && this.currentSortOrder !== sortOrder;
    }

    public isSortArrowActive(sortOrder: SortOrder): boolean {
        return this.sortColumn === this.currentSortColumn && this.currentSortOrder === sortOrder;
    }

    public sort(): void {
        if (this.sortColumn === this.currentSortColumn) {
            this.$emit("update:currentSortOrder", this.currentSortOrder === SortOrder.Asc ? SortOrder.Desc : SortOrder.Asc);
            return;
        }

        this.$emit("update:currentSortOrder", SortOrder.Asc);
        this.$emit("update:currentSortColumn", this.sortColumn);
    }
}