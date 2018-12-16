import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import * as _ from "lodash";
import { namespace } from "vuex-class";

import { MergeCandidate } from "common/dto/history/MergeCandidate";

const ns = namespace("app/history/merger");

@Component
export default class HistoryMerger extends Vue {
    @Prop(Boolean)
    public show!: boolean;

    @ns.State public isActionInProgress!: boolean;
    @ns.State public mergeCandidates!: ReadonlyArray<MergeCandidate>;

    @ns.Action public readonly fetchCandidates!: () => void;

    @Watch("show")
    public onShow() {
        this.fetchCandidates();
    }

    public get show$(): boolean {
        return this.show;
    }

    public set show$(show: boolean) {
        this.$emit("update:show", show);
    }
}