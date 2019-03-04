import { Component, Vue, Prop } from "vue-property-decorator";

import { SortColumn } from "common/dto/history/SortColumn";
import { SortOrder } from "common/dto/history/SortOrder";
import { ColumnSettings } from "common/dto/settings/views-settings/HistoryViewSettings";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { TranslationKey } from "common/dto/translation/TranslationKey";
import { Tag } from "common/dto/history/Tag";

import SortableHeader from "components/history/history-table/sortable-header/SortableHeader.vue";
import TagsEditor from "components/history/tags-editor/TagsEditor.vue";

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

    public isColumnVisible(column: SortColumn): boolean {
        const columnSetting = this.columns.find(setting => setting.column === column);
        return !!columnSetting && columnSetting.isVisible;
    }

    public get numberOfVisibleColumns(): number {
        return this.columns.filter(setting => setting.isVisible).length;
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
}