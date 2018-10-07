import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { injectable } from "inversify";

import { DatastoreProvider } from "data-access/DatastoreProvider";
import { HistoryRecordsMigration } from "business-logic/history/migrations/base/HistoryRecordsMigration";
import { RecordIdGenerator } from "business-logic/history/RecordIdGenerator";

@injectable()
export class AddIdentifierMigration extends HistoryRecordsMigration {

    constructor(private readonly recordIdGenerator: RecordIdGenerator, datastoreProvider: DatastoreProvider) {
        super(datastoreProvider);
        this._priority = 2;
    }

    protected getSelectQuery() {
        return { id: { $exists: false } };
    }
    protected getUpdateQuery(record: HistoryRecord) {
        return { $set: { id: this.recordIdGenerator.generateId(record) } };
    }
}