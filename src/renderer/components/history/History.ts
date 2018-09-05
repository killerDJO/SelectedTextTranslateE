import { Component, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { SortColumn } from "common/dto/history/SortColumn";
import { SortOrder } from "common/dto/history/SortOrder";

import { TranslationResultViewSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { TranslateResult } from "common/dto/translation/TranslateResult";

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
    @ns.State public limit!: number;
    @ns.State public sortColumn!: SortColumn;
    @ns.State public sortOrder!: SortOrder;
    @ns.State public starredOnly!: boolean;

    @ns.State public translateResult!: TranslateResult;
    @ns.State public translationResultViewSettings!: TranslationResultViewSettings;
    @ns.State public isTranslationInProgress!: boolean;
    @ns.State public isTranslationVisible!: boolean;
    @ns.State public defaultView!: TranslateResultViews;

    @ns.Mutation private readonly setLimit!: (limit: number) => void;
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

    public limitOptions = [
        { text: "Last 25", value: 25 },
        { text: "Last 50", value: 50 },
        { text: "Last 100", value: 100 },
        { text: "Last 200", value: 200 },
        { text: "All", value: 1000 }
    ];

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

    public set limit$(value: number) {
        this.setLimit(value);
    }
    public get limit$(): number {
        return this.limit;
    }

    public set starredOnly$(value: boolean) {
        this.setStarredOnly(value);
    }
    public get starredOnly$(): boolean {
        return this.starredOnly;
    }

    @Watch("limit")
    @Watch("sortColumn")
    @Watch("sortOrder")
    @Watch("starredOnly")
    public refreshRecords(): void {
        this.requestHistoryRecords();
    }
}