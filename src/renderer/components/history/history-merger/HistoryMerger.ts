import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import * as _ from "lodash";
import { namespace } from "vuex-class";

import { MergeCandidate, MergeHistoryRecord } from "common/dto/history/MergeCandidate";
import { MergeRecordsRequest } from "common/dto/history/MergeRecordsRequest";
import { BlacklistRecordsRequest } from "common/dto/history/BlacklistRecordsRequest";
import { DataTableConfiguration } from "components/shared/data-table/DataTableConfiguration";

const ns = namespace("app/history/merger");

enum CandidatesTableColumns {
    Word = "word",
    Translation = "translation",
    SourceLanguage = "source-language",
    TargetLanguage = "target-language",
    Candidates = "candidates"
}

enum CandidateTableColumns {
    Word = "word",
    Translation = "translation",
    Times = "times",
    Actions = "actions"
}

@Component
export default class HistoryMerger extends Vue {
    @Prop(Boolean)
    public show!: boolean;

    @Prop(Map)
    public languages!: Map<string, string>;

    @ns.State public isActionInProgress!: boolean;
    @ns.State public mergeCandidates!: ReadonlyArray<MergeCandidate>;

    @ns.Mutation public removeRecordFromCandidate!: (request: { candidate: MergeCandidate; record: MergeHistoryRecord }) => void;
    @ns.Mutation public promoteRecordToCandidate!: (request: { candidate: MergeCandidate; record: MergeHistoryRecord }) => void;

    @ns.Action public readonly fetchCandidates!: () => void;
    @ns.Action public readonly mergeRecords!: (request: MergeRecordsRequest) => void;
    @ns.Action public readonly blacklistRecords!: (request: BlacklistRecordsRequest) => void;

    public CandidatesTableColumns: typeof CandidatesTableColumns = CandidatesTableColumns;
    public candidatesTableConfiguration: DataTableConfiguration = this.getCandidatesTableConfiguration();

    public CandidateTableColumns: typeof CandidateTableColumns = CandidateTableColumns;
    public candidateTableConfiguration: DataTableConfiguration = this.getCandidateTableConfiguration();

    public showLanguages: boolean = false;
    public currentCandidateIndex: number = -1;

    @Watch("show")
    public onShow() {
        this.currentCandidateIndex = -1;
        this.fetchCandidates();
    }

    @Watch("showLanguages", { immediate: true })
    public onShowLanguagesChanged() {
        this.candidatesTableConfiguration.columns
            .filter(column => column.id === CandidatesTableColumns.SourceLanguage || column.id === CandidatesTableColumns.TargetLanguage)
            .forEach(column => column.isVisible = this.showLanguages);
    }

    @Watch("isActionInProgress")
    public onActionProgressChanged() {
        this.candidatesTableConfiguration.isLoading = this.isActionInProgress;
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

    public get currentMergeRecords() {
        if (this.currentCandidate === null) {
            throw Error("Invalid action.");
        }

        return [this.currentCandidate.record].concat(this.currentCandidate.mergeRecords);
    }

    public get isCandidateViewVisible(): boolean {
        return this.currentCandidate !== null;
    }

    public get filteredCandidates(): ReadonlyArray<MergeCandidate> {
        return this.mergeCandidates.filter(candidate => candidate.mergeRecords.length > 0);
    }

    public getCandidatesTableConfiguration(): DataTableConfiguration {
        return {
            columns: [
                { id: CandidatesTableColumns.Word, isVisible: true, weight: 1 },
                { id: CandidatesTableColumns.Translation, isVisible: true, weight: 1 },
                { id: CandidatesTableColumns.SourceLanguage, isVisible: this.showLanguages, weight: 0.5 },
                { id: CandidatesTableColumns.TargetLanguage, isVisible: this.showLanguages, weight: 0.5 },
                { id: CandidatesTableColumns.Candidates, isVisible: true, weight: 0.5 }
            ],
            isLoading: true
        };
    }

    public getCandidateTableConfiguration(): DataTableConfiguration {
        return {
            columns: [
                { id: CandidateTableColumns.Word, isVisible: true, weight: 1 },
                { id: CandidateTableColumns.Translation, isVisible: true, weight: 1 },
                { id: CandidateTableColumns.Times, isVisible: true, weight: 0.5 },
                { id: CandidateTableColumns.Actions, isVisible: true, weight: 0.5 }
            ],
            isLoading: false,
            clickable: false
        };
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

    public blacklistAll(): void {
        this.executeBulkAction(this.blacklist.bind(this));
    }

    public mergeAll(): void {
        this.executeBulkAction(this.merge.bind(this));
    }

    public promote(mergeRecord: MergeHistoryRecord): void {
        if (this.currentCandidate === null) {
            throw Error("Unable to promote when candidate is not selected");
        }

        this.promoteRecordToCandidate({ candidate: this.currentCandidate, record: mergeRecord });
    }

    public getHeaderSlotId(sortColumn: CandidatesTableColumns | CandidateTableColumns): string {
        return `header.${sortColumn}`;
    }

    public getBodySlotId(sortColumn: CandidatesTableColumns | CandidateTableColumns): string {
        return `body.${sortColumn}`;
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

    private executeBulkAction(action: (record: MergeHistoryRecord) => void): void {
        if (this.currentCandidate === null) {
            throw Error("Unable to execute when candidate is not selected");
        }

        this.currentCandidate.mergeRecords.forEach(action);
    }
}