import { injectable, multiInject } from "inversify";
import * as Datastore from "nedb";
import { concat, Observable, of, from } from "rxjs";
import { tap, concatMap } from "rxjs/operators";

import { Logger } from "infrastructure/Logger";
import { DatastoreProvider } from "data-access/DatastoreProvider";

import { HistoryMigration } from "business-logic/history/persistence/migrations/base/HistoryMigration";

@injectable()
export class HistoryMigrator {
    private static readonly HistoryDatabaseKey: string = "history";

    private readonly migrationsStore: Datastore;

    constructor(
        private readonly logger: Logger,
        private readonly datastoreProvider: DatastoreProvider,
        @multiInject(HistoryMigration) private readonly migrations: HistoryMigration[]) {

        this.migrationsStore = this.datastoreProvider.openDatabase("migrations.db");
    }

    public runMigrations(datastore: Datastore): Observable<void> {
        this.logger.info("Start running history migrations.");

        this.migrations.sort((first, second) => first.priority - second.priority);

        return this.getAppliedMigrations().pipe(
            concatMap(appliedMigrations => {
                const migrationsToApply = this.migrations.filter(migration => !appliedMigrations.some(appliedMigration => appliedMigration.name === migration.name));
                this.logger.info(`Applied migrations: ${appliedMigrations.map(migration => migration.name).join(", ") || "[none]"}.`);
                return concat(...migrationsToApply.map(migration => this.runMigration(datastore, migration)));
            }),
            tap({
                complete: () => {
                    datastore.persistence.compactDatafile();
                    this.logger.info("End running history migrations.");
                }
            })
        );
    }

    private runMigration(datastore: Datastore, migration: HistoryMigration): Observable<void> {
        return of(null).pipe(
            tap(() => this.logger.info(`Start running migration: ${migration.name}`)),
            concatMap(() => migration.migrate(datastore)),
            tap({
                complete: () => {
                    this.logger.info(`End running migration: ${migration.name}`);
                    this.addAppliedMigrations(migration.name).subscribe();
                }
            })
        );
    }

    private getAppliedMigrations(): Observable<Migration[]> {
        return this.datastoreProvider.find<Migration>(of(this.migrationsStore), { database: HistoryMigrator.HistoryDatabaseKey });
    }

    private addAppliedMigrations(name: string): Observable<Migration> {
        return this.datastoreProvider.insert(of(this.migrationsStore), { database: HistoryMigrator.HistoryDatabaseKey, name: name });
    }
}

interface Migration {
    readonly database: string;
    readonly name: string;
}