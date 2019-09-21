import { injectable } from "inversify";

import { HistoryRecord } from "common/dto/history/HistoryRecord";

import { DatastoreProvider } from "data-access/DatastoreProvider";

import { HistoryRecordsMigration } from "business-logic/history/persistence/migrations/base/HistoryRecordsMigration";

@injectable()
export class AddLastModificationTimeMigration extends HistoryRecordsMigration {

    constructor(datastoreProvider: DatastoreProvider) {
        // tslint:disable-next-line no-magic-numbers
        super(4, "AddLastModificationTimeMigration", datastoreProvider);
    }

    protected getSelectQuery() {
        return { lastModifiedDate: { $exists: false } };
    }
    protected getUpdateQuery(record: HistoryRecord) {
        return { $set: { lastModifiedDate: this.getLastModifiedDate(record).getTime() } };
    }

    private getLastModifiedDate(record: HistoryRecord): Date {
        return new Date(record.lastTranslatedDate || record.updatedDate);
    }
}