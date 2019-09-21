import { injectable } from "inversify";

import { HistoryRecord } from "common/dto/history/HistoryRecord";

import { DatastoreProvider } from "data-access/DatastoreProvider";

import { HistoryRecordsMigration } from "business-logic/history/persistence/migrations/base/HistoryRecordsMigration";

@injectable()
export class MigrateDatesToNumbers extends HistoryRecordsMigration {

    constructor(datastoreProvider: DatastoreProvider) {
        // tslint:disable-next-line no-magic-numbers
        super(5, "MigrateDatesToNumbers.v2", datastoreProvider);
    }

    protected getSelectQuery() {
        return {};
    }

    protected getUpdateQuery(record: HistoryRecord) {
        return {
            $set: {
                createdDate: this.ensureDate(record.createdDate),
                lastTranslatedDate: this.ensureDate(record.lastTranslatedDate),
                updatedDate: this.ensureDate(record.updatedDate),
            }
        };
    }

    private ensureDate(value: Date | string | number): number {
        return new Date(value).getTime();
    }
}