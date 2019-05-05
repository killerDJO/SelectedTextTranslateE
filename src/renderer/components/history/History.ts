import { Component, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import * as _ from "lodash";

import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { SortColumn } from "common/dto/history/SortColumn";
import { SortOrder } from "common/dto/history/SortOrder";
import { TranslateResultRendererSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { TranslationRequest } from "common/dto/translation/TranslationRequest";
import { AccountInfo } from "common/dto/history/account/AccountInfo";
import { ColumnSettings } from "common/dto/settings/views-settings/HistoryViewSettings";
import { HistoryFilter } from "common/dto/history/HistoryFilter";
import { TranslationKey } from "common/dto/translation/TranslationKey";
import { HistoryRecordViewModel } from "common/dto/history/HistoryRecordsResponse";
import { Tag } from "common/dto/history/Tag";

import HistoryTable from "components/history/history-table/HistoryTable.vue";
import TranslationResult from "components/translation/translation-result/TranslationResult.vue";
import HistoryFilterComponent from "components/history/history-filter/HistoryFilter.vue";
import HistorySync from "components/history/history-sync/HistorySync.vue";
import TagsEditor from "components/history/tags-editor/TagsEditor.vue";
import HistoryMerger from "components/history/history-merger/HistoryMerger.vue";
import ColumnsEditor from "components/history/columns-editor/ColumnsEditor.vue";

const ns = namespace("app/history");

@Component({
    components: {
        HistoryTable,
        TranslationResult,
        HistorySync,
        TagsEditor,
        HistoryFilter: HistoryFilterComponent,
        HistoryMerger,
        ColumnsEditor
    }
})
export default class History extends Vue {
    @ns.State public historyRecords!: HistoryRecordViewModel[];
    @ns.State public currentTags!: ReadonlyArray<Tag>;
    @ns.State public currentUser!: AccountInfo | null;
    @ns.State public pageNumber!: number;
    @ns.State public columns!: ReadonlyArray<ColumnSettings>;
    @ns.State public pageSize!: number;
    @ns.State public totalRecords!: number;
    @ns.State public sortColumn!: SortColumn;
    @ns.State public sortOrder!: SortOrder;
    @ns.State public filter!: HistoryFilter;
    @ns.State public languages!: Map<string, string>;

    @ns.State public translationHistoryRecord!: HistoryRecord | null;
    @ns.State public translationResultViewSettings!: TranslateResultRendererSettings | null;
    @ns.State public isTranslationInProgress!: boolean;
    @ns.State public isOffline!: boolean;
    @ns.State public isTranslationVisible!: boolean;
    @ns.State public defaultTranslateResultView!: TranslateResultViews;

    @ns.Getter public isInitialized!: boolean;

    @ns.Mutation private readonly setPageNumber!: (pageNumber: number) => void;
    @ns.Mutation private readonly setSortColumn!: (sortColumn: SortColumn) => void;
    @ns.Mutation private readonly setSortOrder!: (sortOrder: SortOrder) => void;
    @ns.Mutation private readonly updateFilter!: (filter: Partial<HistoryFilter>) => void;
    @ns.Mutation private readonly clearFilter!: () => void;

    @ns.Mutation public readonly hideTranslation!: () => void;

    @ns.Action private readonly setup!: () => void;
    @ns.Action private readonly requestHistoryRecords!: () => void;
    @ns.Action public readonly setArchivedStatus!: (request: { record: TranslationKey; isArchived: boolean }) => void;
    @ns.Action public readonly playRecord!: (record: TranslationKey) => void;
    @ns.Action public readonly updateCurrentTags!: (tags: ReadonlyArray<Tag>) => void;
    @ns.Action public readonly updateColumns!: (tags: ReadonlyArray<ColumnSettings>) => void;

    @ns.Action public readonly playText!: () => void;
    @ns.Action public readonly translateText!: (request: TranslationRequest) => void;
    @ns.Action public readonly setStarredStatus!: (request: { record: TranslationKey; isStarred: boolean }) => void;
    @ns.Action public readonly updateTags!: (request: { record: TranslationKey; tags: ReadonlyArray<string> }) => void;
    @ns.Action public readonly translateSuggestion!: () => void;
    @ns.Action public readonly forceTranslation!: () => void;
    @ns.Action public readonly refreshTranslation!: () => void;
    @ns.Action public readonly search!: () => void;
    @ns.Action public readonly archive!: (record: TranslationKey) => void;
    @ns.Action public readonly changeLanguage!: () => void;

    public isFilterVisible: boolean = false;
    public isMergerVisible: boolean = false;

    public mounted() {
        this.setup();
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
        this.updateFilter({ starredOnly: value });
    }
    public get starredOnly$(): boolean {
        return this.filter.starredOnly;
    }

    public get pageCount(): number {
        return Math.ceil(this.totalRecords / this.pageSize);
    }

    public get hasRecords(): boolean {
        return this.totalRecords !== 0;
    }

    public onTagClicked(tag: Tag): void {
        if (!this.filter.tags.some(filterTag => filterTag === tag.tag)) {
            this.updateFilter({
                tags: this.filter.tags.concat([tag.tag])
            });
        }

        this.isFilterVisible = true;
        this.hideTranslation();
    }

    public toggleActiveTag(tag: Tag): void {
        const clonedTags = _.cloneDeep(this.currentTags).filter(currentTag => currentTag.tag !== tag.tag);
        this.updateCurrentTags(clonedTags.concat([{
            tag: tag.tag,
            isEnabled: !tag.isEnabled
        }]));
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

    public hideFilter(): void {
        this.isFilterVisible = false;
    }

    @Watch("pageNumber")
    @Watch("pageSize")
    @Watch("sortColumn")
    @Watch("sortOrder")
    @Watch("filter", { deep: true })
    @Watch("currentUser")
    @Watch("isInitialized")
    public refreshRecords(): void {
        this.requestHistoryRecords();
    }

    @Watch("isFilterVisible")
    public onFilterVisibilityChanged(): void {
        if (!this.isFilterVisible) {
            this.clearFilter();
        }
    }
}