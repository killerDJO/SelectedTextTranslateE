import * as Datastore from "nedb";
import { injectable } from "inversify";
import { Observable } from "rxjs";

import { HistoryRecord } from "common/dto/history/HistoryRecord";

import { DatastoreProvider } from "data-access/DatastoreProvider";
import { HistoryMigration } from "business-logic/history/migrations/base/HistoryMigration";

@injectable()
export class AddUniqueIdConstraint extends HistoryMigration {

    constructor(private readonly datastoreProvider: DatastoreProvider) {
        super();
        this._priority = 1;
    }

    public migrate(datastore: Datastore): Observable<void> {
        return this.datastoreProvider.ensureUniqueIndex<HistoryRecord>(datastore, "id");
    }
}