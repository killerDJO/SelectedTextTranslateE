import * as Datastore from "nedb";
import { injectable } from "inversify";
import { Observable } from "rxjs";

import { HistoryRecord } from "common/dto/history/HistoryRecord";

import { DatastoreProvider } from "data-access/DatastoreProvider";
import { HistoryMigration } from "business-logic/history/persistence/migrations/base/HistoryMigration";

@injectable()
export class AddUniqueIdConstraint extends HistoryMigration {

    constructor(private readonly datastoreProvider: DatastoreProvider) {
        super(1, "AddUniqueIdConstraint");
    }

    public migrate(datastore: Datastore): Observable<void> {
        return this.datastoreProvider.ensureUniqueIndex<HistoryRecord>(datastore, "id");
    }
}