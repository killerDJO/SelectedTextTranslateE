import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import * as _ from "lodash";
import { namespace } from "vuex-class";

import { MergeCandidate, MergeHistoryRecord } from "common/dto/history/MergeCandidate";
import { MergeRecordsRequest } from "common/dto/history/MergeRecordsRequest";
import { BlacklistRecordsRequest } from "common/dto/history/BlacklistRecordsRequest";

const ns = namespace("app/history/merger");

@Component
export default class HistoryMerger extends Vue {
    @Prop(Boolean)
    public show!: boolean;

    @Prop(Map)
    public languages!: Map<string, string>;

    @ns.State public isActionInProgress!: boolean;
    @ns.State public mergeCandidates!: ReadonlyArray<MergeCandidate>;

    @ns.Mutation public removeRecordFromCandidate!: (request: { candidate: MergeCandidate, record: MergeHistoryRecord }) => void;
    @ns.Mutation public promoteRecordToCandidate!: (request: { candidate: MergeCandidate, record: MergeHistoryRecord }) => void;

    @ns.Action public readonly fetchCandidates!: () => void;
    @ns.Action public readonly mergeRecords!: (request: MergeRecordsRequest) => void;
    @ns.Action public readonly blacklistRecords!: (request: BlacklistRecordsRequest) => void;

    public showLanguages: boolean = false;
    public currentCandidateIndex: number = -1;

    @Watch("show")
    public onShow() {
        this.currentCandidateIndex = -1;
        this.fetchCandidates();
    }

    public get show$(): boolean {
        return this.show;
    }

    public set show$(show: boolean) {
        this.$emit("update:show", show);
    }

    public get currentCandidate(): MergeCandidate | null {
        return this.mergeCandidates[this.currentCandidateIndex] || null;
    }

    public get isCandidateViewVisible(): boolean {
        return this.currentCandidate !== null;
    }

    public get filteredCandidates(): ReadonlyArray<MergeCandidate> {
        return this.mergeCandidates.filter(candidate => candidate.mergeRecords.length > 0);
    }

    public showCandidate(candidate: MergeCandidate): void {
        this.currentCandidateIndex = this.mergeCandidates.indexOf(candidate);
    }

    public backToCandidates(): void {
        this.currentCandidateIndex = -1;
    }

    public get columnsNumber(): number {
        const DefaultNumberOfColumns = 3;
        const LanguagesColumns = 2;
        return (this.showLanguages ? LanguagesColumns : 0) + DefaultNumberOfColumns;
    }

    public merge(mergeRecord: MergeHistoryRecord): void {
        this.executeAction(mergeRecord, candidate => {
            this.mergeRecords({
                sourceRecord: mergeRecord,
                targetRecord: candidate.record
            });
        });
    }

    public blacklist(mergeRecord: MergeHistoryRecord): void {
        this.executeAction(mergeRecord, candidate => {
            this.blacklistRecords({
                sourceRecordId: mergeRecord.id,
                targetRecordId: candidate.record.id
            });
        });
    }

    public promote(mergeRecord: MergeHistoryRecord): void {
        if (this.currentCandidate === null) {
            throw Error("Unable to promote when candidate is not selected");
        }

        this.promoteRecordToCandidate({ candidate: this.currentCandidate, record: mergeRecord });
    }

    private executeAction(mergeRecord: MergeHistoryRecord, action: (candidate: MergeCandidate) => void): void {
        if (this.currentCandidate === null) {
            throw Error("Unable to execute when candidate is not selected");
        }

        action(this.currentCandidate);

        this.removeRecordFromCandidate({ candidate: this.currentCandidate, record: mergeRecord });

        if (this.currentCandidate.mergeRecords.length === 0) {
            this.backToCandidates();
        }
    }
}