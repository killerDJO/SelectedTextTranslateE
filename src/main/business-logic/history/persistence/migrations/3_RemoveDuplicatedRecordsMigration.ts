import * as Datastore from "nedb";
import { injectable } from "inversify";
import { Observable, of, merge } from "rxjs";
import { concatMap } from "rxjs/operators";
import * as _ from "lodash";

import { HistoryRecord } from "common/dto/history/HistoryRecord";

import { Logger } from "infrastructure/Logger";

import { DatastoreProvider } from "data-access/DatastoreProvider";

import { HistoryMigration } from "business-logic/history/persistence/migrations/base/HistoryMigration";

@injectable()
export class RemoveDuplicatedRecordsMigration extends HistoryMigration {

    constructor(private readonly datastoreProvider: DatastoreProvider, private readonly logger: Logger) {
        // tslint:disable-next-line no-magic-numbers
        super(3, "RemoveDuplicatedRecordsMigration");
    }

    public migrate(datastore: Datastore): Observable<void> {
        return this.datastoreProvider.find<HistoryRecord>(of(datastore), {}).pipe(
            concatMap((historyRecords: HistoryRecord[]) => {
                const duplicatedIds = _(historyRecords)
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