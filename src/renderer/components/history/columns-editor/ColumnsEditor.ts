import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import * as _ from "lodash";

import { DropCheckItem } from "components/shared/drop-check-button/DropCheckButton";
import { ColumnSettings } from "common/dto/settings/views-settings/HistoryViewSettings";
import { SortColumn } from "common/dto/history/SortColumn";

import { ColumnNameResolver } from "components/history/ColumnNameResolver";

interface ColumnDisplaySettings extends DropCheckItem {
    readonly column: SortColumn;
}

@Component
export default class ColumnsEditor extends Vue {
    private readonly columnNameResolver: ColumnNameResolver = new ColumnNameResolver();

    @Prop(Array) public columns!: ReadonlyArray<ColumnSettings>;

    public columnDisplaySettings: ReadonlyArray<ColumnDisplaySettings> = [];

    @Watch("columns", { deep: true, immediate: true })
    public buildColumnDisplaySettings(): void {
        this.columnDisplaySettings = this.columns.map(columnSetting => ({
            column: columnSetting.column,
            text: this.columnNameResolver.getColumnName(columnSetting.column),
            isChecked: columnSetting.isVisible,
            isDisabled: false
        }));
    }

    @Watch("columnDisplaySettings", { deep: true })
    public onColumnSettingsChanged() {
        this.setColumnSettingsDisabledState();

        const updatedColumns: ColumnSettings[] = this.columnDisplaySettings.map(setting => ({
            column: setting.column,
            isVisible: setting.isChecked
        }));

        if (!_.isEqual(this.columns, updatedColumns)) {
            this.$emit("update-columns", updatedColumns);
        }
    }

    private setColumnSettingsDisabledState(): void {
        const numberOfHiddenColumns = this.columnDisplaySettings.filter(setting => !setting.isChecked).length;
        const shouldDisableColumnsHide = numberOfHiddenColumns >= (this.columnDisplaySettings.length - 1);
        this.columnDisplaySettings.forEach(setting => setting.isDisabled = setting.isChecked && shouldDisableColumnsHide);
    }
}