import { Component, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { SortColumn } from "common/dto/history/SortColumn";
import { SortOrder } from "common/dto/history/SortOrder";

import { TranslationViewRendererSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";

import SortableHeader from "components/history/sortable-header/SortableHeader.vue";
import TranslationResult from "components/translation/translation-result/TranslationResult.vue";

const ns = namespace("app/history");

@Component({
    components: {
        SortableHeader,
        TranslationResult
    }
})
export default class History extends Vue {
    @ns.State public historyRecords!: HistoryRecord[];
    @ns.State public pageNumber!: number;
    @ns.State public pageSize!: number;
    @ns.State public totalRecords!: number;
    @ns.State public sortColumn!: SortColumn;
    @ns.State public sortOrder!: SortOrder;
    @ns.State public starredOnly!: boolean;

    @ns.State public translateResultHistoryRecord!: HistoryRecord | null;
    @ns.State public translationResultViewSettings!: TranslationViewRendererSettings;
    @ns.State public isTranslationInProgress!: boolean;
    @ns.State public isTranslationVisible!: boolean;
    @ns.State public defaultView!: TranslateResultViews;

    @ns.Mutation private readonly setPageNumber!: (pageNumber: number) => void;
    @ns.Mutation private readonly setSortColumn!: (sortColumn: SortColumn) => void;
    @ns.Mutation private readonly setSortOrder!: (sortOrder: SortOrder) => void;
    @ns.Mutation private readonly setStarredOnly!: (starredOnly: boolean) => void;

    @ns.Mutation public readonly hideTranslation!: () => void;

    @ns.Action private readonly setup!: () => void;
    @ns.Action private readonly requestHistoryRecords!: () => void;
    @ns.Action public readonly setStarredStatus!: (request: { record: HistoryRecord; isStarred: boolean }) => void;

    @ns.Action public readonly playText!: () => void;
    @ns.Action public readonly translateText!: (text: string) => void;
    @ns.Action public readonly translateSuggestion!: () => void;
    @ns.Action public readonly forceTranslation!: () => void;

    public SortColumn: typeof SortColumn = SortColumn;

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

    public get pageCount(): number {
        return Math.ceil(this.totalRecords / this.pageSize);
    }

    @Watch("pageNumber")
    @Watch("sortColumn")
    @Watch("sortOrder")
    @Watch("starredOnly")
    public refreshRecords(): void {
        this.requestHistoryRecords();
    }
}