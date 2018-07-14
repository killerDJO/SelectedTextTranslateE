import { Component, Prop, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { HistoryRecord } from "common/dto/history/HistoryRecord";

const ns = namespace("app/history");

@Component
export default class History extends Vue {
    @ns.State public historyRecords!: HistoryRecord[];

    @ns.Action private readonly fetchData!: () => void;

    constructor() {
        super();
        this.fetchData();
    }
}