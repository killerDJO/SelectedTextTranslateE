import { Component, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import * as _ from "lodash";

import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { SortColumn } from "common/dto/history/SortColumn";
import { SortOrder } from "common/dto/history/SortOrder";
import { TranslationViewRendererSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { TranslationRequest } from "common/dto/translation/TranslationRequest";
import { AccountInfo } from "common/dto/history/account/AccountInfo";
import { ColumnSettings } from "common/dto/settings/views-settings/HistoryViewSettings";

import SortableHeader from "components/history/sortable-header/SortableHeader.vue";
import TranslationResult from "components/translation/translation-result/TranslationResult.vue";
import HistorySync from "components/history/history-sync/HistorySync.vue";
import TagsEditor from "components/history/tags-editor/TagsEditor.vue";
import { DropCheckItem } from "components/shared/drop-check-button/DropCheckButton";

const ns = namespace("app/history");

interface ColumnDisplaySettings extends DropCheckItem {
    readonly column: SortColumn;
}

@Component({
    components: {
        SortableHeader,
        TranslationResult,
        HistorySync,
        TagsEditor
    }
})
export default class History extends Vue {
    @ns.State public isInitialized!: boolean;
    @ns.State public historyRecords!: HistoryRecord[];
    @ns.State public currentTags!: ReadonlyArray<string>;
    @ns.State public currentUser!: AccountInfo | null;
    @ns.State public pageNumber!: number;
    @ns.State public columns!: ReadonlyArray<ColumnSettings>;
    @ns.State public pageSize!: number;
    @ns.State public totalRecords!: number;
    @ns.State public sortColumn!: SortColumn;
    @ns.State public sortOrder!: SortOrder;
    @ns.State public starredOnly!: boolean;
    @ns.State public includeArchived!: boolean;
    @ns.State public languages!: Map<string, string>;

    @ns.State public translationHistoryRecord!: HistoryRecord | null;
    @ns.State public translationResultViewSettings!: TranslationViewRendererSettings | null;
    @ns.State public isTranslationInProgress!: boolean;
    @ns.State public isOffline!: boolean;
    @ns.State public isTranslationVisible!: boolean;
    @ns.State public defaultTranslateResultView!: TranslateResultViews;

    @ns.Mutation private readonly setPageNumber!: (pageNumber: number) => void;
    @ns.Mutation private readonly setSortColumn!: (sortColumn: SortColumn) => void;
    @ns.Mutation private readonly setSortOrder!: (sortOrder: SortOrder) => void;
    @ns.Mutation private readonly setStarredOnly!: (starredOnly: boolean) => void;
    @ns.Mutation private readonly setIncludeArchived!: (includeArchived: boolean) => void;

    @ns.Mutation public readonly hideTranslation!: () => void;

    @ns.Action private readonly setup!: () => void;
    @ns.Action private readonly requestHistoryRecords!: () => void;
    @ns.Action public readonly setArchivedStatus!: (request: { record: HistoryRecord; isArchived: boolean }) => void;
    @ns.Action public readonly playRecord!: (record: HistoryRecord) => void;
    @ns.Action public readonly updateCurrentTags!: (tags: ReadonlyArray<string>) => void;
    @ns.Action public readonly updateColumns!: (tags: ReadonlyArray<ColumnSettings>) => void;

    @ns.Action public readonly playText!: () => void;
    @ns.Action public readonly translateText!: (request: TranslationRequest) => void;
    @ns.Action public readonly setStarredStatus!: (request: { record: HistoryRecord; isStarred: boolean }) => void;
    @ns.Action public readonly updateTags!: (request: { record: HistoryRecord; tags: ReadonlyArray<string> }) => void;
    @ns.Action public readonly translateSuggestion!: () => void;
    @ns.Action public readonly forceTranslation!: () => void;
    @ns.Action public readonly refreshTranslation!: () => void;
    @ns.Action public readonly search!: () => void;
    @ns.Action public readonly changeLanguage!: () => void;

    public SortColumn: typeof SortColumn = SortColumn;
    public columnToNameMap: Map<SortColumn, string> = new Map<SortColumn, string>([
        [SortColumn.Input, "Word"],
        [SortColumn.Translation, "Translation"],
        [SortColumn.Tags, "Tags"],
        [SortColumn.TimesTranslated, "Times"],
        [SortColumn.SourceLanguage, "Source"],
        [SortColumn.TargetLanguage, "Target"],
        [SortColumn.LastTranslatedDate, "Last Translated"],
        [SortColumn.IsArchived, "Status"]
    ]);
    public columnSettings: ReadonlyArray<ColumnDisplaySettings> = [];

    public mounted() {
        this.setup();
        this.requestHistoryRecords();
    }

    public set sortColumn$(value: SortColumn) {
        this.setSortColumn(value);
    }
    public get sortColumn$(): SortColumn {
        return this.sortColumn;
    }

    public set sortOrder$(value: SortOrder) {
        this.setSortOrder(value);
    }
    public get sortOrder$(): SortOrder {
        return this.sortOrder;
    }

    public set pageNumber$(value: number) {
        this.setPageNumber(value);
    }
    public get pageNumber$(): number {
        return this.pageNumber;
    }

    public set starredOnly$(value: boolean) {
        this.setStarredOnly(value);
    }
    public get starredOnly$(): boolean {
        return this.starredOnly;
    }

    public set includeArchived$(value: boolean) {
        this.setIncludeArchived(value);
    }
    public get includeArchived$(): boolean {
        return this.includeArchived;
    }

    public get pageCount(): number {
        return Math.ceil(this.totalRecords / this.pageSize);
    }

    public get hasRecords(): boolean {
        return this.totalRecords !== 0;
    }

    public isColumnVisible(column: SortColumn): boolean {
        const columnSetting = this.columnSettings.find(setting => setting.column === column);
        return !!columnSetting && columnSetting.isChecked;
    }

    public updateRecordTags(record: HistoryRecord, tags: ReadonlyArray<string>) {
        this.updateTags({ record, tags });
    }

    public translateHistoryRecord(record: HistoryRecord): void {
        this.translateText({
            text: record.sentence,
            isForcedTranslation: record.isForcedTranslation,
            refreshCache: false,
            sourceLanguage: record.sourceLanguage,
            targetLanguage: record.targetLanguage
        });
    }

    public isRecordSyncedWithServer(record: HistoryRecord): boolean {
        if (!this.currentUser) {
            return false;
        }

        const currentUser = this.currentUser;
        const currentSyncData = (record.syncData || []).find(syncData => syncData.userEmail === currentUser.email);
        if (!currentSyncData) {
            return false;
        }

        return currentSyncData.lastModifiedDate === record.lastModifiedDate;
    }

    @Watch("pageNumber")
    @Watch("pageSize")
    @Watch("sortColumn")
    @Watch("sortOrder")
    @Watch("starredOnly")
    @Watch("includeArchived")
    @Watch("currentUser")
    public refreshRecords(): void {
        this.requestHistoryRecords();
    }

    @Watch("columns", { deep: true, immediate: true })
    public buildColumnDisplaySettings(): void {
        this.columnSettings = this.columns.map(columnSetting => ({
            column: columnSetting.column,
            text: this.columnToNameMap.has(columnSetting.column) ? this.columnToNameMap.get(columnSetting.column) as string : columnSetting.column.toString(),
            isChecked: columnSetting.isVisible,
            isDisabled: false
        }));
    }

    @Watch("columnSettings", { deep: true })
    public onColumnSettingsChanged() {
        this.setColumnSettingsDisabledState();

        const updatedColumns: ColumnSettings[] = this.columnSettings.map(setting => ({
            column: setting.column,
            isVisible: setting.isChecked
        }));

        if (!_.isEqual(this.columns, updatedColumns)) {
            this.updateColumns(updatedColumns);
        }
    }

    private setColumnSettingsDisabledState(): void {
        const numberOfHiddenColumns = this.columnSettings.filter(setting => !setting.isChecked).length;
        const shouldDisableColumnsHide = numberOfHiddenColumns >= (this.columnSettings.length - 1);
        this.columnSettings.forEach(setting => setting.isDisabled = setting.isChecked && shouldDisableColumnsHide);
    }
}