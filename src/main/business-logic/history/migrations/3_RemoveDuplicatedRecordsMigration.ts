import * as Datastore from "nedb";
import { injectable } from "inversify";
import { Observable, of, merge } from "rxjs";
import { concatMap } from "rxjs/operators";
import * as _ from "lodash";

import { HistoryRecord } from "common/dto/history/HistoryRecord";

import { DatastoreProvider } from "data-access/DatastoreProvider";
import { HistoryMigration } from "business-logic/history/migrations/base/HistoryMigration";
import { Logger } from "infrastructure/Logger";

@injectable()
export class RemoveDuplicatedRecordsMigration extends HistoryMigration {

    constructor(private readonly datastoreProvider: DatastoreProvider, private readonly logger: Logger) {
        super();
        this._priority = 3;
    }

    public migrate(datastore: Datastore): Observable<void> {
        return this.datastoreProvider.find<HistoryRecord>(of(datastore), {}).pipe(
            concatMap((historyRecords: HistoryRecord[]) => {
                const duplicatedIds = _<HistoryRecord[]>(historyRecords)
                    .map(record => record.id)
                    .groupBy()
                    .pickBy(x => x.length > 1)
                    .keys()
                    .value();

                const recordsToRemove: HistoryRecord[] = [];
                for (const id of duplicatedIds) {
                    const duplicatedRecords = _.filter<HistoryRecord>(historyRecords, record => record.id === id).slice(1);
                    recordsToRemove.push(...duplicatedRecords);
                    this.logger.info(`Found duplicate for record with id ${id}. Duplicates will be removed.`);
                }

                return merge(...recordsToRemove.map(record => this.datastoreProvider.remove(of(datastore), record)));
            })
        );
    }
}