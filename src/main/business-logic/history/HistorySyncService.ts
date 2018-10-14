import { injectable } from "inversify";
import * as Datastore from "nedb";
import { Observable, of, Subject, pipe } from "rxjs";
import { tap, map, concatMap } from "rxjs/operators";

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
    private readonly datastore$: Observable<Datastore>;
    private readonly syncStateUpdatedSubject$: Subject<HistoryRecord> = new Subject();

    constructor(
        private readonly serviceRendererProvider: ServiceRendererProvider,
        private readonly datastoreProvider: DatastoreProvider,
        private readonly historyStore: HistoryStore,
        private readonly historyDatabaseProvider: HistoryDatabaseProvider,
        private readonly settingsProvider: SettingsProvider,
        private readonly logger: Logger) {

        this.datastore$ = this.historyDatabaseProvider.historyDatastore$;
    }

    public get syncStateUpdated$(): Observable<HistoryRecord> {
        return this.syncStateUpdatedSubject$;
    }

    public startSync(): void {
        const messageBus = new MessageBus(this.serviceRendererProvider.getServiceRenderer());
        const settings = this.settingsProvider.getSettings().value;
        messageBus.handleCommand(Messages.HistorySync.UnSyncedHistoryRecords, () => this.getHistoryRecordsToSync());
        messageBus.handleCommand<HistoryRecord>(Messages.HistorySync.UpdateRecord, record => this.updateRecord(record));
        messageBus.handleCommand<HistoryRecord>(Messages.HistorySync.MergeRecord, record => this.mergeRecord(record));
        messageBus.handleCommand<void, string | undefined>(Messages.HistorySync.LastSyncTime, () => of(this.getLastSyncTime()));
        messageBus.handleCommand<string>(Messages.HistorySync.SetLastSyncTime, lastSyncTime => of(this.setLastSyncTime(lastSyncTime)));
        messageBus.sendValue<FirebaseSettings>(Messages.HistorySync.FirebaseSettings, settings.firebase);
        messageBus.sendValue<HistorySyncSettings>(Messages.HistorySync.HistorySyncSettings, this.getHistorySyncSettings());
        messageBus.sendNotification(Messages.HistorySync.StartSync);
        messageBus.registerObservable(Messages.HistorySync.HistoryRecord, this.historyStore.historyUpdated$);
    }

    private getHistorySyncSettings(): HistorySyncSettings {
        return this.settingsProvider.getSettings().value.history.sync;
    }

    private getLastSyncTime(): string | undefined {
        return this.getHistorySyncSettings().lastSyncTime;
    }

    private setLastSyncTime(lastSyncTime: string): void {
        this.settingsProvider.updateSettings({
            history: {
                sync: {
                    lastSyncTime: lastSyncTime
                }
            }
        });
    }

    private getHistoryRecordsToSync(): Observable<HistoryRecord[]> {
        return this.datastoreProvider
            .find<HistoryRecord>(this.datastore$, { $not: { isSyncedWithServer: true } });
    }

    private updateRecord(record: HistoryRecord): Observable<void> {
        if (!record.id) {
            throw Error("Record with an id must be provided");
        }

        this.logger.info(`Updating ${this.getLogKey(record)} after syncing with server.`);
        return this.checkThatRecordUpdated(
            this.datastoreProvider.update<HistoryRecord>(this.datastore$, { id: record.id, lastModifiedDate: record.lastModifiedDate }, record),
            record);
    }

    private mergeRecord(serverRecord: HistoryRecord): Observable<void> {
        const recordKey: TranslationKey = {
            sentence: serverRecord.sentence,
            isForcedTranslation: serverRecord.isForcedTranslation,
            sourceLanguage: serverRecord.sourceLanguage,
            targetLanguage: serverRecord.targetLanguage
        };
        return this.historyStore.getRecord(recordKey).pipe(concatMap(existingRecord => {
            if (!existingRecord) {
                this.logger.info(`New ${this.getLogKey(serverRecord)} has been created from server.`);
                this.datastoreProvider.insert(this.datastore$, serverRecord).subscribe();
                return of(void 0);
            }

            if (!!existingRecord.serverTimestamp && existingRecord.serverTimestamp === serverRecord.serverTimestamp) {
                return of(void 0);
            }

            const newerRecord = this.getLastModifiedDate(existingRecord) > this.getLastModifiedDate(serverRecord)
                ? existingRecord
                : serverRecord;
            const newerTranslateResultRecord = new Date(existingRecord.updatedDate) > new Date(serverRecord.updatedDate)
                ? existingRecord
                : serverRecord;

            const mergedRecord: HistoryRecord = {
                ...recordKey,
                id: existingRecord.id,
                createdDate: newerRecord.createdDate,
                translateResult: newerTranslateResultRecord.translateResult,
                updatedDate: newerTranslateResultRecord.updatedDate,
                lastTranslatedDate: newerRecord.lastTranslatedDate,
                lastModifiedDate: newerRecord.lastModifiedDate,
                translationsNumber: serverRecord.translationsNumber + (existingRecord.translationsNumber - (existingRecord.serverTranslationsNumber || 0)),
                serverTranslationsNumber: serverRecord.translationsNumber,
                isArchived: newerRecord.isArchived,
                isStarred: newerRecord.isStarred,
                serverTimestamp: serverRecord.serverTimestamp,
                isSyncedWithServer: false
            };

            this.logger.info(`Existing ${this.getLogKey(serverRecord)} has been merged with server record.`);
            return this.checkThatRecordUpdated(
                this.datastoreProvider.update(this.datastore$, { id: mergedRecord.id, lastModifiedDate: existingRecord.lastModifiedDate }, mergedRecord),
                mergedRecord);
        }));
    }

    private checkThatRecordUpdated(updateResult: Observable<HistoryRecord>, record: HistoryRecord): Observable<void> {
        return updateResult.pipe(
            tap(historyRecord => {
                if (!historyRecord) {
                    this.logger.warning(`Failed to saved ${this.getLogKey(record)}.`);
                }
            }),
            tap(updatedRecord => this.notifyAboutUpdate(updatedRecord)),
            map(() => void 0),
        );
    }

    private getLastModifiedDate(record: HistoryRecord): Date {
        return new Date(record.lastModifiedDate);
    }

    private getLogKey(record: HistoryRecord): string {
        return `record with sentence "${record.sentence}" when forced translation is set to "${record.isForcedTranslation}" with languages ${record.sourceLanguage}-${record.targetLanguage}`;
    }

    private notifyAboutUpdate(record: HistoryRecord): void {
        this.syncStateUpdatedSubject$.next(record);
    }
}