import { injectable } from "inversify";
import { Observable, concat } from "rxjs";
import { map, concatMap, tap } from "rxjs/operators";
import * as _ from "lodash";

import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { MergeRecordsRequest } from "common/dto/history/MergeRecordsRequest";
import { BlacklistRecordsRequest } from "common/dto/history/BlacklistRecordsRequest";
import { MergeCandidate, MergeHistoryRecord } from "common/dto/history/MergeCandidate";

import { Logger } from "infrastructure/Logger";

import { HistoryStore } from "business-logic/history/HistoryStore";
import { ServiceRendererProvider } from "infrastructure/ServiceRendererProvider";
import { MessageBus } from "infrastructure/MessageBus";
import { Messages } from "common/messaging/Messages";

@injectable()
export class HistoryMerger {

    private readonly messageBus: MessageBus;

    constructor(
        private readonly historyStore: HistoryStore,
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
        return this.historyStore.getRecordById(request.sourceRecordId).pipe(
            concatMap(sourceRecord => {
                if (sourceRecord === null) {
                    throw new Error(`History record with id ${request.sourceRecordId} doesn't exist`);
                }
                const updatedRecord = {
                    ...sourceRecord,
                    blacklistedMergeRecords: (sourceRecord.blacklistedMergeRecords || []).concat(request.targetRecordId)
                };
                return this.historyStore.updateRecord(updatedRecord).pipe(
                    tap(_ => this.logger.info(`Records has been added to the merge blacklist. Source: ${request.sourceRecordId}, Target: ${request.targetRecordId}`)),
                    map(_ => void 0));
            })
        );
    }

    public getMergeCandidates(): Observable<ReadonlyArray<MergeCandidate>> {
        return this.historyStore.getActiveRecords().pipe(
            concatMap(records => this.findMergeCandidates(records)),
            map(records => this.filterBlacklistedRecords(records))
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

    private filterBlacklistedRecords(candidates: ReadonlyArray<MergeCandidate>): ReadonlyArray<MergeCandidate> {
        return candidates.map(candidate => {
            const mergeCandidate: MergeCandidate = {
                record: candidate.record,
                mergeRecords: candidate.mergeRecords.filter(mergeRecord => !this.isBlacklistedCandidate(candidate.record, mergeRecord))
            };
            return mergeCandidate;
        });
    }

    private isBlacklistedCandidate(record: MergeHistoryRecord, candidate: MergeHistoryRecord): boolean {
        const NotFoundIndex = -1;
        return record.blacklistedMergeRecords.indexOf(candidate.id) !== NotFoundIndex || candidate.blacklistedMergeRecords.indexOf(record.id) !== NotFoundIndex;
    }
}