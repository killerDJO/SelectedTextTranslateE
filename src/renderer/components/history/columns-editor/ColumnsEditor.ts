import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import * as _ from "lodash";

import { DropCheckItem } from "components/shared/drop-check-button/DropCheckButton";
import { ColumnSettings } from "common/dto/settings/views-settings/HistoryViewSettings";
import { SortColumn } from "common/dto/history/SortColumn";

import { ColumnNameResolver } from "components/history/ColumnNameResolver";

interface ColumnDisplaySettings extends DropCheckItem {
    readonly column: SortColumn;
    readonly weight: number;
}

@Component
export default class ColumnsEditor extends Vue {
    private readonly columnNameResolver: ColumnNameResolver = new ColumnNameResolver();

    @Prop(Array) public columns!: ReadonlyArray<ColumnSettings>;

    public columnDisplaySettings: ReadonlyArray<ColumnDisplaySettings> = [];
    public closeBlocked: boolean = false;

    @Watch("columns", { deep: true, immediate: true })
    public buildColumnDisplaySettings(): void {
        this.columnDisplaySettings = this.columns.map(columnSetting => ({
            column: columnSetting.column,
            text: this.columnNameResolver.getColumnName(columnSetting.column),
            isChecked: columnSetting.isVisible,
            weight: columnSetting.weight,
            isDisabled: false
        }));
    }

    @Watch("columnDisplaySettings", { deep: true })
    public onColumnSettingsChanged() {
        this.setColumnSettingsDisabledState();

        const updatedColumns: ColumnSettings[] = this.mapDisplaySettings(this.columnDisplaySettings);

        if (!_.isEqual(this.columns, updatedColumns)) {
            this.$emit("update-columns", updatedColumns);
        }
    }

    public moveUp(item: ColumnDisplaySettings): void {
        if (!this.isMoveUpEnabled(item)) {
            return;
        }

        this.moveItem(item, itemIndex => itemIndex - 1);
    }

    public moveDown(item: ColumnDisplaySettings): void {
        if (!this.isMoveDownEnabled(item)) {
            return;
        }

        this.moveItem(item, itemIndex => itemIndex + 1);
    }

    public isMoveUpEnabled(item: ColumnDisplaySettings): boolean {
        return this.columnDisplaySettings.indexOf(item) > 0;
    }

    public isMoveDownEnabled(item: ColumnDisplaySettings): boolean {
        return this.columnDisplaySettings.indexOf(item) < this.columnDisplaySettings.length - 1;
    }

    private moveItem(item: ColumnDisplaySettings, nextIndexGenerator: (index: number) => number): void {
        this.closeBlocked = true;

        const itemIndex = this.columnDisplaySettings.indexOf(item);
        const clonedDisplaySettings = this.columnDisplaySettings.slice();
        const swap = clonedDisplaySettings[itemIndex];

        const nextIndex = nextIndexGenerator(itemIndex);
        clonedDisplaySettings[itemIndex] = clonedDisplaySettings[nextIndex];
        clonedDisplaySettings[nextIndex] = swap;
        this.$emit("update-columns", this.mapDisplaySettings(clonedDisplaySettings));

        // Hack: drop loses focus after re-render, prevent close until this
        setTimeout(() => this.closeBlocked = false, 100);
    }

    private mapDisplaySettings(displaySettings: ReadonlyArray<ColumnDisplaySettings>): ColumnSettings[] {
        return displaySettings.map(setting => ({
            column: setting.column,
            isVisible: setting.isChecked,
            weight: setting.weight
        }));
    }

    private setColumnSettingsDisabledState(): void {
        const numberOfHiddenColumns = this.columnDisplaySettings.filter(setting => !setting.isChecked).length;
        const shouldDisableColumnsHide = numberOfHiddenColumns >= (this.columnDisplaySettings.length - 1);
        this.columnDisplaySettings.forEach(setting => setting.isDisabled = setting.isChecked && shouldDisableColumnsHide);
    }
}