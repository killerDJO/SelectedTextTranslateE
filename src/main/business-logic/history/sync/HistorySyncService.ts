import { injectable } from "inversify";
import * as Datastore from "nedb";
import { Observable, of, Subject, Subscription, empty } from "rxjs";
import { tap, map, concatMap } from "rxjs/operators";
import * as _ from "lodash";

import { Messages } from "common/messaging/Messages";
import { HistoryRecord, SyncData } from "common/dto/history/HistoryRecord";
import { TranslationKey } from "common/dto/translation/TranslationKey";
import { FirebaseSettings } from "common/dto/settings/FirebaseSettings";
import { HistorySyncSettings } from "common/dto/settings/HistorySyncSettings";
import { SyncRequest } from "common/dto/history/SyncRequest";
import { AccountInfo } from "common/dto/history/account/AccountInfo";

import { MessageBus } from "infrastructure/MessageBus";
import { ServiceRendererProvider } from "infrastructure/ServiceRendererProvider";
import { Logger } from "infrastructure/Logger";

import { DatastoreProvider } from "data-access/DatastoreProvider";

import { HistoryDatabaseProvider } from "business-logic/history/persistence/HistoryDatabaseProvider";
import { HistoryStore } from "business-logic/history/HistoryStore";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { AccountHandler } from "business-logic/history/sync/AccountHandler";

@injectable()
export class HistorySyncService {
    private readonly datastore$: Observable<Datastore>;
    private readonly syncStateUpdatedSubject$: Subject<HistoryRecord> = new Subject();
    private readonly messageBus: MessageBus;

    private historyUpdateSubscription: Subscription | null = null;
    private syncActionsQueue$: Observable<void> = empty();
    private currentHistorySyncSettings: HistorySyncSettings | null = null;

    public isSyncInProgress$!: Observable<boolean>;

    constructor(
        private readonly serviceRendererProvider: ServiceRendererProvider,
        private readonly datastoreProvider: DatastoreProvider,
        private readonly historyStore: HistoryStore,
        private readonly historyDatabaseProvider: HistoryDatabaseProvider,
        private readonly settingsProvider: SettingsProvider,
        private readonly logger: Logger,
        private readonly accountHandler: AccountHandler) {

        this.datastore$ = this.historyDatabaseProvider.historyDatastore$;
        this.messageBus = new MessageBus(this.serviceRendererProvider.getServiceRenderer());

        this.setupMessageBus();
        this.subscribeToSettingsChange();
    }

    public get syncStateUpdated$(): Observable<HistoryRecord> {
        return this.syncStateUpdatedSubject$;
    }

    public startContinuousSync(): void {
        this.runActionOnSyncActionsQueue(() => {
            this.destroyHistoryUpdateSubscription();
            this.historyUpdateSubscription = this.messageBus.registerObservable(Messages.HistorySync.HistoryRecord, this.historyStore.historyUpdated$).subscription;
            return this.messageBus.sendValue<SyncRequest>(Messages.HistorySync.StartSync, { isContinuous: true, isForcedPull: false });
        });
    }

    public stopContinuousSync(): void {
        this.runActionOnSyncActionsQueue(() => {
            this.destroyHistoryUpdateSubscription();
            return this.messageBus.sendNotification(Messages.HistorySync.StopSync);
        });
    }

    public startSingleSync(isForcedPull: boolean): void {
        this.messageBus.sendValue<SyncRequest>(Messages.HistorySync.StartSync, { isContinuous: false, isForcedPull: isForcedPull });
    }

    private runActionOnSyncActionsQueue(action: () => Observable<void>): void {
        this.syncActionsQueue$.subscribe({
            complete: () => {
                const actionResult = action();
                this.syncActionsQueue$ = this.syncActionsQueue$.pipe(concatMap(() => actionResult));
            }
        });
    }

    private destroyHistoryUpdateSubscription(): void {
        if (this.historyUpdateSubscription !== null) {
            this.historyUpdateSubscription.unsubscribe();
            this.historyUpdateSubscription = null;
        }
    }

    private subscribeToSettingsChange(): void {
        this.settingsProvider.getSettings()
            .subscribe(newSettings => {
                const newHistorySyncSettings = newSettings.history.sync;

                if (this.accountHandler.currentUser$.value !== null) {
                    this.synchronizeSyncState(newHistorySyncSettings);
                }

                this.currentHistorySyncSettings = newHistorySyncSettings;
            });

        this.accountHandler.currentUser$.subscribe(currentUser => {
            if (this.getHistorySyncSettings().isContinuousSyncEnabled && currentUser !== null) {
                this.startContinuousSync();
            }
        });
    }

    private synchronizeSyncState(newHistorySyncSettings: HistorySyncSettings): void {
        if (this.currentHistorySyncSettings === null) {
            if (newHistorySyncSettings.isContinuousSyncEnabled) {
                this.startContinuousSync();
            }
        } else if (!newHistorySyncSettings.isContinuousSyncEnabled) {
            this.stopContinuousSync();
        } else if (newHistorySyncSettings.isContinuousSyncEnabled && (!this.currentHistorySyncSettings.isContinuousSyncEnabled || this.currentHistorySyncSettings.interval !== newHistorySyncSettings.interval)) {
            this.stopContinuousSync();
            this.startContinuousSync();
        }
    }

    private setupMessageBus(): void {
        const settings = this.settingsProvider.getSettings().value;

        this.messageBus.handleCommand(Messages.HistorySync.UnSyncedHistoryRecords, () => this.getHistoryRecordsToSync());
        this.messageBus.handleCommand<HistoryRecord>(Messages.HistorySync.UpdateRecord, record => this.updateRecord(record));
        this.messageBus.handleCommand<HistoryRecord>(Messages.HistorySync.MergeRecord, record => this.mergeRecord(record));
        this.messageBus.handleCommand<void, string | undefined>(Messages.HistorySync.LastSyncTime, () => this.getLastSyncTime());
        this.messageBus.sendValue<FirebaseSettings>(Messages.HistorySync.FirebaseSettings, settings.firebase);
        this.messageBus.handleCommand<void, HistorySyncSettings>(Messages.HistorySync.HistorySyncSettings, () => of(this.getHistorySyncSettings()));

        this.isSyncInProgress$ = this.messageBus.observeCommand<boolean>(Messages.HistorySync.IsSyncInProgress);
    }

    private getHistorySyncSettings(): HistorySyncSettings {
        return this.settingsProvider.getSettings().value.history.sync;
    }

    private getLastSyncTime(): Observable<string | undefined> {
        return this.datastoreProvider
            .find<HistoryRecord>(this.datastore$, {})
            .pipe(
                map(records => this.getLastSyncTimeFromRecords(this.getCurrentUser(), records))
            );
    }

    private getLastSyncTimeFromRecords(currentUser: AccountInfo, records: HistoryRecord[]): string | undefined {
        let maxTimestamp: string | undefined;

        for (const record of records) {

            const serverTimestamp = this.getServerTimestamp(record, currentUser);
            if (!serverTimestamp) {
                continue;
            }

            if (!maxTimestamp || new Date(serverTimestamp) > new Date(maxTimestamp)) {
                maxTimestamp = serverTimestamp;
            }
        }

        return maxTimestamp;
    }

    private getServerTimestamp(record: HistoryRecord, currentUser: AccountInfo): string | undefined {
        const syncData = this.getUserSyncData(record, currentUser.email);
        if (!syncData) {
            return undefined;
        }
        return syncData.serverTimestamp;
    }

    private getHistoryRecordsToSync(): Observable<HistoryRecord[]> {
        return this.datastoreProvider
            .find<HistoryRecord>(this.datastore$, {}, { lastTranslatedDate: -1 })
            .pipe(map(records => records.filter(record => this.isRecordModified(record, this.getCurrentUser()))));
    }

    private isRecordModified(record: HistoryRecord, currentUser: AccountInfo): boolean {
        const syncData = this.getUserSyncData(record, currentUser.email);
        return !syncData || syncData.lastModifiedDate !== record.lastModifiedDate;
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
        return this.historyStore.getRecord(recordKey).pipe(
            concatMap(existingRecord => {
                if (!existingRecord) {
                    this.logger.info(`New ${this.getLogKey(serverRecord)} has been created from server.`);
                    return this.datastoreProvider.insert(this.datastore$, this.cleanupDatesInRecord(serverRecord)).pipe(
                        tap<HistoryRecord>(record => this.notifyAboutUpdate(record)),
                        map(() => void 0)
                    );
                }

                const currentUser = this.getCurrentUser();
                const existingSyncData = this.getUserSyncData(existingRecord, currentUser.email);
                const serverSyncData = this.getUserSyncData(serverRecord, currentUser.email);

                if (!serverSyncData) {
                    throw Error("Server sync for current user data must be present in server record");
                }

                if (!!existingSyncData && existingSyncData.serverTimestamp === serverSyncData.serverTimestamp) {
                    return of(void 0);
                }

                const newerRecord = this.getLastModifiedDate(existingRecord) > this.getLastModifiedDate(serverRecord)
                    ? existingRecord
                    : serverRecord;
                const newerTranslateResultRecord = new Date(existingRecord.updatedDate) > new Date(serverRecord.updatedDate)
                    ? existingRecord
                    : serverRecord;

                const filteredSyncData = (existingRecord.syncData || []).filter(syncData => syncData.userEmail !== currentUser.email);

                const serverTranslationsNumber = !existingSyncData ? 0 : (existingSyncData.serverTranslationsNumber || 0);
                const serverTags = !existingSyncData ? [] : (existingSyncData.serverTags || []);

                const mergedRecord: HistoryRecord = {
                    ...recordKey,
                    id: existingRecord.id,
                    createdDate: this.ensureDate(newerRecord.createdDate),
                    translateResult: newerTranslateResultRecord.translateResult,
                    updatedDate: this.ensureDate(newerTranslateResultRecord.updatedDate),
                    lastTranslatedDate: this.ensureDate(newerRecord.lastTranslatedDate),
                    lastModifiedDate: newerRecord.lastModifiedDate,
                    translationsNumber: serverRecord.translationsNumber + (existingRecord.translationsNumber - serverTranslationsNumber),
                    isArchived: newerRecord.isArchived,
                    isStarred: newerRecord.isStarred,
                    tags: this.mergeTags(existingRecord.tags || [], serverTags, serverRecord.tags || []),
                    blacklistedMergeRecords: _.uniq((existingRecord.blacklistedMergeRecords || []).concat(serverRecord.blacklistedMergeRecords || [])),
                    syncData: [
                        ...filteredSyncData,
                        {
                            userEmail: currentUser.email,
                            serverTimestamp: serverSyncData.serverTimestamp,
                            serverTranslationsNumber: serverRecord.translationsNumber,
                            serverTags: serverRecord.tags,
                            lastModifiedDate: serverRecord.lastModifiedDate
                        }
                    ]
                };

                this.logger.info(`Existing ${this.getLogKey(serverRecord)} has been merged with server record.`);
                return this.checkThatRecordUpdated(
                    this.datastoreProvider.update(this.datastore$, { id: mergedRecord.id, lastModifiedDate: existingRecord.lastModifiedDate }, mergedRecord),
                    mergedRecord);
            }));
    }

    private mergeTags(currentTags: ReadonlyArray<string>, currentServerTags: ReadonlyArray<string>, serverTags: ReadonlyArray<string>): ReadonlyArray<string> {
        const addedTags = this.getMissingTags(currentTags, currentServerTags);
        const removedTags = this.getMissingTags(currentServerTags, currentTags);
        return this.getMissingTags(serverTags.slice().concat(addedTags), removedTags);
    }

    private getMissingTags(baseTags: ReadonlyArray<string>, targetTags: ReadonlyArray<string>): ReadonlyArray<string> {
        return baseTags.filter(baseTag => !targetTags.some(targetTag => targetTag === baseTag));
    }

    private getUserSyncData(record: HistoryRecord, userEmail: string): SyncData | undefined {
        return (record.syncData || []).find(syncData => syncData.userEmail === userEmail);
    }

    private cleanupDatesInRecord(record: HistoryRecord): HistoryRecord {
        return {
            ...record,
            createdDate: this.ensureDate(record.createdDate),
            updatedDate: this.ensureDate(record.updatedDate),
            lastTranslatedDate: this.ensureDate(record.lastTranslatedDate),
        };
    }

    private getCurrentUser(): AccountInfo {
        if (this.accountHandler.currentUser$.value === null) {
            throw Error("Unable to sync when current user is not set");
        }

        return this.accountHandler.currentUser$.value;
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

    private ensureDate(value: Date | string | number): number {
        return new Date(value).getTime();
    }
}