import { injectable } from "inversify";
import * as Datastore from "nedb";
import { AsyncSubject } from "rxjs";

import { DatastoreProvider } from "data-access/DatastoreProvider";
import { HistoryMigrator } from "business-logic/history/persistence/HistoryMigrator";
import { HistoryBackuper } from "business-logic/history/persistence/HistoryBackuper";

@injectable()
export class HistoryDatabaseProvider {
    private static readonly DatabaseFileName: string = "history.db";

    public readonly historyDatastore$: AsyncSubject<Datastore> = new AsyncSubject();

    constructor(
        private readonly datastoreProvider: DatastoreProvider,
        private readonly historyMigrator: HistoryMigrator,
        private readonly historyBackuper: HistoryBackuper) {

        const datastore = this.datastoreProvider.openDatabase(HistoryDatabaseProvider.DatabaseFileName);
        this.historyDatastore$.next(datastore);

        this.historyBackuper.createBackups(HistoryDatabaseProvider.DatabaseFileName).subscribe({
            complete: () => {
                this.historyMigrator.runMigrations(datastore).subscribe({
                    complete: () => {
                        this.historyDatastore$.complete();
                    }
                });
            }
        });
    }
}