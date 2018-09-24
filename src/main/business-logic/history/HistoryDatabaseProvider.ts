import { injectable } from "inversify";
import * as Datastore from "nedb";

import { DatastoreProvider } from "data-access/DatastoreProvider";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";

@injectable()
export class HistoryDatabaseProvider {
    private readonly datastore: Datastore;

    constructor(
        private readonly datastoreProvider: DatastoreProvider,
        private readonly settingsProvider: SettingsProvider) {

        const historySettings = this.settingsProvider.getSettings().value.history;
        this.datastore = this.datastoreProvider.openDatabase(historySettings.databaseName);
    }

    public get(): Datastore {
        return this.datastore;
    }
}