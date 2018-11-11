import * as Datastore from "nedb";
import { injectable } from "inversify";
import { Observable, merge, of } from "rxjs";
import { concatMap, map } from "rxjs/operators";

import { HistoryRecord } from "common/dto/history/HistoryRecord";

import { DatastoreProvider } from "data-access/DatastoreProvider";

import { HistoryMigration } from "business-logic/history/persistence/migrations/base/HistoryMigration";

@injectable()
export abstract class HistoryRecordsMigration extends HistoryMigration {
    constructor(priority: number, name: string, private readonly datastoreProvider: DatastoreProvider) {
        super(priority, name);
    }

    public migrate(datastore: Datastore): Observable<void> {
        return this.datastoreProvider
            .find<HistoryRecord>(of(datastore), this.getSelectQuery())
            .pipe(concatMap(historyRecords => this.updateHistoryRecords(datastore, historyRecords)));
    }

    private updateHistoryRecords(datastore: Datastore, records: HistoryRecord[]): Observable<void> {
        const updateTasks = records.map(record => {
            return this.datastoreProvider
                .update<HistoryRecord>(of(datastore), { _id: (record as any)._id }, this.getUpdateQuery(record))
                .pipe(map(() => undefined));
        });
        return merge(...updateTasks);
    }

    protected abstract getSelectQuery(): any;

    protected abstract getUpdateQuery(record: HistoryRecord): any;
}