import { injectable, multiInject } from "inversify";
import * as Datastore from "nedb";
import { AsyncSubject, merge, Observable, of } from "rxjs";
import { tap, concatMap } from "rxjs/operators";

import { Logger } from "infrastructure/Logger";
import { DatastoreProvider } from "data-access/DatastoreProvider";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { HistoryMigration } from "business-logic/history/migrations/base/HistoryMigration";

@injectable()
export class HistoryDatabaseProvider {
    public readonly historyDatastore$: AsyncSubject<Datastore> = new AsyncSubject();

    constructor(
        private readonly datastoreProvider: DatastoreProvider,
        private readonly settingsProvider: SettingsProvider,
        private readonly logger: Logger,
        @multiInject(HistoryMigration) private readonly migrations: HistoryMigration[]) {

        const historySettings = this.settingsProvider.getSettings().value.history;
        const datastore = this.datastoreProvider.openDatabase(historySettings.databaseName);
        this.historyDatastore$.next(datastore);

        this.runMigrations(datastore);
    }

    private runMigrations(datastore: Datastore): void {
        this.logger.info("Start running history migrations.");

        this.migrations.sort((first, second) => first.priority - second.priority);
        merge(...this.migrations.map(migration => this.runMigration(datastore, migration)), 1)
            .subscribe({
                complete: () => {
                    this.logger.info("End running history migrations.");
                    this.historyDatastore$.complete();
                }
            });
    }

    private runMigration(datastore: Datastore, migration: HistoryMigration): Observable<void> {
        return of(void 0).pipe(
            tap(() => this.logger.info(`Start running migration: ${migration.name}`)),
            concatMap(() => migration.migrate(datastore)),
            tap({
                complete: () => this.logger.info(`End running migration: ${migration.name}`)
            })
        );
    }
}