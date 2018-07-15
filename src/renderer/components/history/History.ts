import { Component, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { SortColumn } from "common/dto/history/SortColumn";
import { SortOrder } from "common/dto/history/SortOrder";

import SortableHeader from "components/history/sortable-header/SortableHeader.vue";

const ns = namespace("app/history");

@Component({
    components: {
        SortableHeader
    }
})
export default class History extends Vue {
    @ns.State public historyRecords!: HistoryRecord[];
    @ns.State public limit!: number;
    @ns.State public sortColumn!: SortColumn;
    @ns.State public sortOrder!: SortOrder;

    @ns.Mutation private readonly setLimit!: (limit: number) => void;
    @ns.Mutation private readonly setSortColumn!: (sortColumn: SortColumn) => void;
    @ns.Mutation private readonly setSortOrder!: (sortOrder: SortOrder) => void;

    @ns.Action private readonly setup!: () => void;
    @ns.Action private readonly requestHistoryRecords!: () => void;
    @ns.Action public readonly translateWord!: (word: string) => void;

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

    @Watch("limit")
    @Watch("sortColumn")
    @Watch("sortOrder")
    private refreshRecords(): void {
        this.requestHistoryRecords();
    }
}