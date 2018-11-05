import { injectable, multiInject } from "inversify";
import * as Datastore from "nedb";
import { merge, Observable, of } from "rxjs";
import { tap, concatMap } from "rxjs/operators";

import { Logger } from "infrastructure/Logger";
import { HistoryMigration } from "business-logic/history/persistence/migrations/base/HistoryMigration";

@injectable()
export class HistoryMigrator {
    constructor(private readonly logger: Logger, @multiInject(HistoryMigration) private readonly migrations: HistoryMigration[]) {
    }

    public runMigrations(datastore: Datastore): Observable<void> {
        this.logger.info("Start running history migrations.");

        this.migrations.sort((first, second) => first.priority - second.priority);
        return merge(...this.migrations.map(migration => this.runMigration(datastore, migration)), 1)
            .pipe(tap(() => this.logger.info("End running history migrations.")));
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