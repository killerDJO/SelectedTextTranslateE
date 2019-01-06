import { injectable } from "inversify";
import * as Datastore from "nedb";
import { Observable, of } from "rxjs";
import { tap, map } from "rxjs/operators";

import { Logger } from "infrastructure/Logger";
import { DatastoreProvider } from "data-access/DatastoreProvider";

@injectable()
export class MergeBlacklist {
    private readonly blacklistStore$: Observable<Datastore>;

    constructor(
        private readonly logger: Logger,
        private readonly datastoreProvider: DatastoreProvider) {

        this.blacklistStore$ = of(this.datastoreProvider.openDatabase("merge-blacklist.db"));
    }

    public addToBlacklist(sourceRecordId: string, targetRecordId: string): Observable<void> {
        const recordToAdd: MergeBlacklistRecord = {
            sourceRecordId,
            targetRecordId
        };

        return this.datastoreProvider.insert<MergeBlacklistRecord>(this.blacklistStore$, recordToAdd).pipe(
            tap(record => this.logger.info(`Records has been added to the merge blacklist. Source: ${record.sourceRecordId}, Target: ${record.targetRecordId}`)),
            map(_ => void 0));
    }

    public isBlacklistedMerge(sourceRecordId: string, targetRecordId: string): Observable<boolean> {
        return this.datastoreProvider.find<MergeBlacklistRecord>(this.blacklistStore$, {
            $or: [
                {
                    sourceRecordId: sourceRecordId,
                    targetRecordId: targetRecordId
                },
                {
                    sourceRecordId: targetRecordId,
                    targetRecordId: sourceRecordId
                }]
        }).pipe(map(records => records.length > 0));
    }
}

interface MergeBlacklistRecord {
    readonly sourceRecordId: string;
    readonly targetRecordId: string;
}