import { injectable } from "inversify";
import * as Datastore from "nedb";
import { AsyncSubject } from "rxjs";
import { concatMap } from "rxjs/operators";

import { DatastoreProvider } from "data-access/DatastoreProvider";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { HistorySettings } from "business-logic/settings/dto/Settings";
import { HistoryMigrator } from "business-logic/history/persistence/HistoryMigrator";
import { HistoryBackuper } from "business-logic/history/persistence/HistoryBackuper";

@injectable()
export class HistoryDatabaseProvider {
    public readonly historyDatastore$: AsyncSubject<Datastore> = new AsyncSubject();

    constructor(
        private readonly datastoreProvider: DatastoreProvider,
        private readonly settingsProvider: SettingsProvider,
        private readonly historyMigrator: HistoryMigrator,
        private readonly historyBackuper: HistoryBackuper) {

        const datastore = this.datastoreProvider.openDatabase(this.getHistorySettings().databaseName);
        this.historyDatastore$.next(datastore);

        this.historyBackuper.createBackups().subscribe({
            complete: () => {
                this.historyMigrator.runMigrations(datastore).subscribe({
                    complete: () => {
                        this.historyDatastore$.complete();
                    }
                });
            }
        });
    }

    private getHistorySettings(): HistorySettings {
        return this.settingsProvider.getSettings().value.history;
    }
}