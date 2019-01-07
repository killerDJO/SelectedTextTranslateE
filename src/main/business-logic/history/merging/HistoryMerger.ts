import { injectable } from "inversify";
import { Observable, concat, forkJoin } from "rxjs";
import { map, concatMap } from "rxjs/operators";
import * as _ from "lodash";

import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { MergeRecordsRequest } from "common/dto/history/MergeRecordsRequest";
import { BlacklistRecordsRequest } from "common/dto/history/BlacklistRecordsRequest";
import { MergeCandidate } from "common/dto/history/MergeCandidate";

import { Logger } from "infrastructure/Logger";

import { HistoryStore } from "business-logic/history/HistoryStore";
import { MergeBlacklist } from "business-logic/history/merging/MergeBlacklist";
import { ServiceRendererProvider } from "infrastructure/ServiceRendererProvider";
import { MessageBus } from "infrastructure/MessageBus";
import { Messages } from "common/messaging/Messages";

@injectable()
export class HistoryMerger {

    private readonly messageBus: MessageBus;

    constructor(
        private readonly historyStore: HistoryStore,
        private readonly mergeBlacklist: MergeBlacklist,
        private readonly logger: Logger,
        serviceRendererProvider: ServiceRendererProvider) {
        this.messageBus = new MessageBus(serviceRendererProvider.getServiceRenderer());
    }

    public mergeRecords(request: MergeRecordsRequest): Observable<void> {
        return this.historyStore.getRecord(request.sourceRecord).pipe(
            concatMap(sourceRecord => this.historyStore.getRecord(request.targetRecord)
                .pipe(concatMap(targetRecord => this.mergeRecordsInternal(sourceRecord, targetRecord))))
        );
    }

    public blacklistRecords(request: BlacklistRecordsRequest): Observable<void> {
        return this.mergeBlacklist.addToBlacklist(request.sourceRecordId, request.targetRecordId);
    }

    public getMergeCandidates(): Observable<ReadonlyArray<MergeCandidate>> {
        return this.historyStore.getActiveRecords().pipe(
            concatMap(records => this.findMergeCandidates(records)),
            concatMap(records => this.filterBlacklistedRecords(records))
        );
    }

    private findMergeCandidates(records: HistoryRecord[]): Observable<ReadonlyArray<MergeCandidate>> {
        return this.messageBus.sendValue<HistoryRecord[], ReadonlyArray<MergeCandidate>>(Messages.ServiceRenderer.MergeCandidates, records);
    }

    private mergeRecordsInternal(sourceRecord: HistoryRecord | null, targetRecord: HistoryRecord | null): Observable<void> {
        if (sourceRecord === null || targetRecord === null) {
            throw new Error("Invalid operation.");
        }

        this.logger.info(`Merge history records: ${sourceRecord.id} and ${targetRecord.id}`);

        const updatedTargetRecord: HistoryRecord = {
            ...targetRecord,
            translationsNumber: targetRecord.translationsNumber + sourceRecord.translationsNumber,
            tags: _.uniq((targetRecord.tags || []).concat(sourceRecord.tags || []))
        };

        const updatedSourceRecord: HistoryRecord = {
            ...sourceRecord,
            isArchived: true,
            tags: _.uniq((sourceRecord.tags || []).concat(["Merged"]))
        };

        return concat(this.historyStore.updateRecord(updatedTargetRecord), this.historyStore.updateRecord(updatedSourceRecord)).pipe(map(() => void 0));
    }

    private filterBlacklistedRecords(candidates: ReadonlyArray<MergeCandidate>): Observable<ReadonlyArray<MergeCandidate>> {
        const filteredCandidates = candidates.map(candidate => {
            return forkJoin(candidate.mergeRecords
                .map(record => this.mergeBlacklist.isBlacklistedMerge(record.id, candidate.record.id).pipe(map(isBlacklisted => ({ isBlacklisted, record: record })))))
                .pipe(map(filteredMergeRecords => {
                    const mergeCandidate: MergeCandidate = {
                        record: candidate.record,
                        mergeRecords: filteredMergeRecords.filter(mergeRecord => !mergeRecord.isBlacklisted).map(mergeRecord => mergeRecord.record)
                    };
                    return mergeCandidate;
                }));
        });

        return forkJoin(filteredCandidates).pipe(map(filteredCandidate => filteredCandidate.filter(candidate => candidate.mergeRecords.length > 0)));
    }
}