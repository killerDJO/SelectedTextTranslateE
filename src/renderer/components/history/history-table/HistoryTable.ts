import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import { SortColumn } from "common/dto/history/SortColumn";
import { SortOrder } from "common/dto/history/SortOrder";
import { ColumnSettings } from "common/dto/settings/views-settings/HistoryViewSettings";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { TranslationKey } from "common/dto/translation/TranslationKey";
import { Tag } from "common/dto/history/Tag";

import SortableHeader from "components/history/history-table/sortable-header/SortableHeader.vue";
import TagsEditor from "components/history/tags-editor/TagsEditor.vue";
import { DataTableColumnConfiguration, DataTableConfiguration } from "components/shared/data-table/DataTableConfiguration";

@Component({
    components: {
        SortableHeader,
        TagsEditor
    }
})
export default class HistoryTable extends Vue {
    @Prop(Array) public historyRecords!: ReadonlyArray<HistoryRecord>;
    @Prop(String) public sortColumn!: SortColumn;
    @Prop(Number) public sortOrder!: SortOrder;
    @Prop(Array) public columns!: ReadonlyArray<ColumnSettings>;
    @Prop(Map) public languages!: Map<string, string>;

    public SortColumn: typeof SortColumn = SortColumn;

    public tableConfiguration: DataTableConfiguration<HistoryRecord> | null = null;

    @Watch("columns", { deep: true, immediate: true })
    public onColumnsChanged(): void {
        this.tableConfiguration = {
            columns: this.columns.map<DataTableColumnConfiguration>(column => ({
                id: column.column,
                isVisible: column.isVisible,
                weight: column.weight
            })),
            onRecordClick: this.translateHistoryRecord.bind(this)
        };
    }

    public set sortColumn$(value: SortColumn) {
        this.$emit("update:sortColumn", value);
    }
    public get sortColumn$(): SortColumn {
        return this.sortColumn;
    }

    public set sortOrder$(value: SortOrder) {
        this.$emit("update:sortOrder", value);
    }
    public get sortOrder$(): SortOrder {
        return this.sortOrder;
    }

    public translateHistoryRecord(record: HistoryRecord): void {
        this.$emit("translate-history-record", record);
    }

    public setStarredStatus(request: { record: TranslationKey; isStarred: boolean }): void {
        this.$emit("set-starred-status", request);
    }

    public playRecord(record: TranslationKey): void {
        this.$emit("play-record", record);
    }

    public updateRecordTags(record: HistoryRecord, tags: ReadonlyArray<Tag>): void {
        this.$emit("update-tags", { record, tags: tags.map(tag => tag.tag) });
    }

    public tagClicked(tag: Tag): void {
        this.$emit("tag-clicked", tag);
    }

    public setArchivedStatus(request: { record: TranslationKey; isArchived: boolean }): void {
        this.$emit("set-archived-status", request);
    }

    public getHeaderSlotId(sortColumn: SortColumn): string {
        return `header.${sortColumn}`;
    }

    public getBodySlotId(sortColumn: SortColumn): string {
        return `body.${sortColumn}`;
    }

    public updateColumnsConfiguration(columnsConfiguration: ReadonlyArray<DataTableColumnConfiguration>): void {
        const updatedColumns: ReadonlyArray<ColumnSettings> = columnsConfiguration.map(column => ({
            column: column.id as SortColumn,
            isVisible: column.isVisible,
            weight: column.weight
        }));
        this.$emit("update-columns", updatedColumns);
    }
}