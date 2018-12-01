import { injectable } from "inversify";

import { HistoryRecord } from "common/dto/history/HistoryRecord";

import { DatastoreProvider } from "data-access/DatastoreProvider";

import { HistoryRecordsMigration } from "business-logic/history/persistence/migrations/base/HistoryRecordsMigration";

@injectable()
export class MigrateDatesToNumbers extends HistoryRecordsMigration {

    constructor(datastoreProvider: DatastoreProvider) {
        super(5, "MigrateDatesToNumbers", datastoreProvider);
    }

    protected getSelectQuery() {
        return {};
    }
    protected getUpdateQuery(record: HistoryRecord) {
        return {
            $set: {
                createdDate: new Date(record.createdDate).getTime(),
                lastTranslatedDate: new Date(record.lastTranslatedDate).getTime(),
                updatedDate: new Date(record.updatedDate).getTime(),
            }
        };
    }
}