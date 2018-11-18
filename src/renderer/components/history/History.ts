import { Component, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";

import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { SortColumn } from "common/dto/history/SortColumn";
import { SortOrder } from "common/dto/history/SortOrder";
import { TranslationViewRendererSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { TranslationRequest } from "common/dto/translation/TranslationRequest";
import { AccountInfo } from "common/dto/history/account/AccountInfo";

import SortableHeader from "components/history/sortable-header/SortableHeader.vue";
import TranslationResult from "components/translation/translation-result/TranslationResult.vue";
import HistorySync from "components/history/history-sync/HistorySync.vue";
import TagsEditor from "components/history/tags-editor/TagsEditor.vue";

const ns = namespace("app/history");

@Component({
    components: {
        SortableHeader,
        TranslationResult,
        HistorySync,
        TagsEditor
    }
})
export default class History extends Vue {
    @ns.State public historyRecords!: HistoryRecord[];
    @ns.State public currentTags!: ReadonlyArray<string>;
    @ns.State public currentUser!: AccountInfo | null;
    @ns.State public pageNumber!: number;
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
    public showLanguages: boolean = false;

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
    @Watch("sortColumn")
    @Watch("sortOrder")
    @Watch("starredOnly")
    @Watch("includeArchived")
    @Watch("currentUser")
    public refreshRecords(): void {
        this.requestHistoryRecords();
    }
}