import { injectable } from "inversify";
import * as Datastore from "nedb";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import { MessageBus } from "infrastructure/MessageBus";
import { ServiceRendererProvider } from "infrastructure/ServiceRendererProvider";
import { Messages } from "common/messaging/Messages";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { DatastoreProvider } from "data-access/DatastoreProvider";
import { Logger } from "infrastructure/Logger";

import { HistoryDatabaseProvider } from "business-logic/history/HistoryDatabaseProvider";
import { HistoryStore } from "business-logic/history/HistoryStore";
import { TranslationKey } from "common/dto/translation/TranslationKey";
import { FirebaseSettings } from "common/dto/settings/FirebaseSettings";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { HistorySyncSettings } from "common/dto/settings/HistorySyncSettings";

@injectable()
export class HistorySyncService {
    private readonly datastore: Datastore;

    constructor(
        private readonly serviceRendererProvider: ServiceRendererProvider,
        private readonly datastoreProvider: DatastoreProvider,
        private readonly historyStore: HistoryStore,
        private readonly historyDatabaseProvider: HistoryDatabaseProvider,
        private readonly settingsProvider: SettingsProvider,
        private readonly logger: Logger) {

        this.datastore = this.historyDatabaseProvider.get();
    }

    public startSync(): void {
        const messageBus = new MessageBus(this.serviceRendererProvider.getServiceRenderer());
        const settings = this.settingsProvider.getSettings().value;
        messageBus.returnValue(Messages.HistorySync.HistoryRecords, () => this.getHistoryRecordsToSync());
        messageBus.observeValue<HistoryRecord>(Messages.HistorySync.UpdateRecord).subscribe(record => this.updateRecord(record));
        messageBus.observeValue<HistoryRecord>(Messages.HistorySync.MergeRecord).subscribe(record => this.mergeRecord(record));
        messageBus.sendValue<FirebaseSettings>(Messages.HistorySync.FirebaseSettings, settings.firebase);
        messageBus.sendValue<HistorySyncSettings>(Messages.HistorySync.HistorySyncSettings, settings.history.sync);
        messageBus.sendNotification(Messages.HistorySync.StartSync);
    }

    private getHistoryRecordsToSync(): Observable<HistoryRecord[]> {
        return this.datastoreProvider
            .find<HistoryRecord>(this.datastore, { $not: { isSyncedWithServer: true } });
    }

    private updateRecord(record: HistoryRecord): void {
        if (!record._id) {
            throw Error("Record with an _id must be provided");
        }

        this.logger.info(`Updating ${this.getLogKey(record)} after syncing to server.`);
        this.datastoreProvider
            .update<HistoryRecord>(this.datastore, { _id: record._id }, record)
            .subscribe();
    }

    private mergeRecord(serverRecord: HistoryRecord): void {
        const recordKey: TranslationKey = {
            sentence: serverRecord.sentence,
            isForcedTranslation: serverRecord.isForcedTranslation,
            sourceLanguage: serverRecord.sourceLanguage,
            targetLanguage: serverRecord.targetLanguage
        };
        this.historyStore.getRecord(recordKey).subscribe(existingRecord => {
            if (!existingRecord) {
                this.logger.info(`New ${this.getLogKey(serverRecord)} has been created from server.`);
                this.datastoreProvider.insert(this.datastore, serverRecord).subscribe();
                return;
            }

            if (!!existingRecord.serverTimestamp && existingRecord.serverTimestamp === serverRecord.serverTimestamp) {
                return;
            }

            const newerRecord = this.getLastModifiedDate(existingRecord) > this.getLastModifiedDate(serverRecord)
                ? existingRecord
                : serverRecord;
            const newerTranslateResultRecord = new Date(existingRecord.updatedDate) > new Date(serverRecord.updatedDate)
                ? existingRecord
                : serverRecord;

            const mergedRecord: HistoryRecord = {
                ...recordKey,
                _id: existingRecord._id,
                createdDate: newerRecord.createdDate,
                translateResult: newerTranslateResultRecord.translateResult,
                updatedDate: newerTranslateResultRecord.updatedDate,
                lastTranslatedDate: newerRecord.lastTranslatedDate,
                lastModifiedDate: newerRecord.lastModifiedDate,
                translationsNumber: newerRecord.translationsNumber,
                isArchived: newerRecord.isArchived,
                isStarred: newerRecord.isStarred,
                serverTimestamp: serverRecord.serverTimestamp,
                isSyncedWithServer: false
            };

            this.logger.info(`Existing ${this.getLogKey(serverRecord)} has been merged with server record.`);
            this.datastoreProvider.update(this.datastore, { _id: mergedRecord._id }, mergedRecord).subscribe();
        });
    }

    private getLastModifiedDate(record: HistoryRecord): Date {
        return new Date(record.lastModifiedDate || record.lastTranslatedDate || record.updatedDate);
    }

    private getLogKey(record: HistoryRecord): string {
        return `record with sentence "${record.sentence}" when forced translation is set to "${record.isForcedTranslation}" with languages ${record.sourceLanguage}-${record.targetLanguage}`;
    }
}