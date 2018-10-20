import { injectable } from "inversify";
import * as Datastore from "nedb";
import { Observable, of, Subject, Subscription, AsyncSubject } from "rxjs";
import { tap, map, concatMap } from "rxjs/operators";

import { Messages } from "common/messaging/Messages";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { TranslationKey } from "common/dto/translation/TranslationKey";
import { FirebaseSettings } from "common/dto/settings/FirebaseSettings";
import { HistorySyncSettings } from "common/dto/settings/HistorySyncSettings";
import { AccountInfo } from "common/dto/history/account/AccountInfo";
import { SignRequest } from "common/dto/history/account/SignRequest";
import { SignInResponse } from "common/dto/history/account/SignInResponse";
import { SignUpResponse } from "common/dto/history/account/SignUpResponse";
import { SignResponse } from "common/dto/history/account/SignResponse";

import { MessageBus } from "infrastructure/MessageBus";
import { ServiceRendererProvider } from "infrastructure/ServiceRendererProvider";
import { Logger } from "infrastructure/Logger";

import { DatastoreProvider } from "data-access/DatastoreProvider";

import { HistoryDatabaseProvider } from "business-logic/history/HistoryDatabaseProvider";
import { HistoryStore } from "business-logic/history/HistoryStore";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { NotificationSender } from "infrastructure/NotificationSender";

@injectable()
export class HistorySyncService {
    private readonly datastore$: Observable<Datastore>;
    private readonly syncStateUpdatedSubject$: Subject<HistoryRecord> = new Subject();
    private readonly messageBus: MessageBus;

    private historyUpdateSubscription: Subscription | null = null;

    public currentUser$!: Observable<AccountInfo | null>;
    public isSyncInProgress$!: Observable<boolean>;

    constructor(
        private readonly serviceRendererProvider: ServiceRendererProvider,
        private readonly datastoreProvider: DatastoreProvider,
        private readonly historyStore: HistoryStore,
        private readonly historyDatabaseProvider: HistoryDatabaseProvider,
        private readonly settingsProvider: SettingsProvider,
        private readonly logger: Logger,
        private readonly notificationSender: NotificationSender) {

        this.datastore$ = this.historyDatabaseProvider.historyDatastore$;
        this.messageBus = new MessageBus(this.serviceRendererProvider.getServiceRenderer());

        this.setupMessageBus();
        this.signInIfHasSavedData();
    }

    public get syncStateUpdated$(): Observable<HistoryRecord> {
        return this.syncStateUpdatedSubject$;
    }

    public signInUser(signRequest: SignRequest): Observable<SignInResponse> {
        this.logger.info(`Sign in to account ${signRequest.email}.`);
        return this.messageBus.sendValue<SignRequest, SignInResponse>(Messages.HistorySync.SignIn, signRequest).pipe(
            tap(response => this.trySaveUserCredentials(signRequest, response)),
            tap(response => this.logUnsuccessfulResponse(response))
        );
    }

    public signUpUser(signRequest: SignRequest): Observable<SignUpResponse> {
        this.logger.info(`Sign up to account ${signRequest.email}.`);
        return this.messageBus.sendValue<SignRequest, SignUpResponse>(Messages.HistorySync.SignUp, signRequest).pipe(
            tap(response => this.trySaveUserCredentials(signRequest, response)),
            tap(response => this.logUnsuccessfulResponse(response)),
            concatMap(response => response.isSuccessful ? this.signInUser(signRequest).pipe(map(_ => response)) : of(response))
        );
    }

    public signOutUser(): Observable<void> {
        this.logger.info("Sign out from account");
        return this.messageBus.sendNotification(Messages.HistorySync.SignOut).pipe(
            tap(() => this.clearUserCredentials())
        );
    }

    public startContinuousSync(): void {
        this.messageBus.sendValue(Messages.HistorySync.StartSync, true);
        this.historyUpdateSubscription = this.messageBus.registerObservable(Messages.HistorySync.HistoryRecord, this.historyStore.historyUpdated$).subscription;
    }

    public stopContinuousSync(): void {
        if (this.historyUpdateSubscription !== null) {
            this.historyUpdateSubscription.unsubscribe();
        }

        this.messageBus.sendNotification(Messages.HistorySync.StopSync);
    }

    public startSingleSync(): void {
        this.messageBus.sendValue(Messages.HistorySync.StartSync, false);
    }

    private trySaveUserCredentials(signRequest: SignRequest, signResponse: SignResponse<any>): void {
        if (signResponse.isSuccessful) {
            this.updateCredentials(signRequest.email, signRequest.password);
        }
    }

    private logUnsuccessfulResponse(signResponse: SignResponse<any>): void {
        if (!signResponse.isSuccessful) {
            this.logger.info(`Authorization error. ${signResponse.validationCode}`);
        }
    }

    private clearUserCredentials() {
        this.updateCredentials("", "");
    }

    private updateCredentials(email: string, password: string) {
        this.settingsProvider.updateSettings({
            history: {
                sync: {
                    email: email,
                    password: password
                }
            }
        });
    }

    private setupMessageBus(): void {
        const settings = this.settingsProvider.getSettings().value;

        this.messageBus.handleCommand(Messages.HistorySync.UnSyncedHistoryRecords, () => this.getHistoryRecordsToSync());
        this.messageBus.handleCommand<HistoryRecord>(Messages.HistorySync.UpdateRecord, record => this.updateRecord(record));
        this.messageBus.handleCommand<HistoryRecord>(Messages.HistorySync.MergeRecord, record => this.mergeRecord(record));
        this.messageBus.handleCommand<void, string | undefined>(Messages.HistorySync.LastSyncTime, () => of(this.getLastSyncTime()));
        this.messageBus.handleCommand<string>(Messages.HistorySync.SetLastSyncTime, lastSyncTime => of(this.setLastSyncTime(lastSyncTime)));
        this.messageBus.sendValue<FirebaseSettings>(Messages.HistorySync.FirebaseSettings, settings.firebase);
        this.messageBus.handleCommand<void, HistorySyncSettings>(Messages.HistorySync.HistorySyncSettings, () => of(this.getHistorySyncSettings()));

        this.isSyncInProgress$ = this.messageBus.observeCommand<boolean>(Messages.HistorySync.IsSyncInProgress);
        this.currentUser$ = this.messageBus.observeCommand<AccountInfo | null>(Messages.HistorySync.CurrentUser);
    }

    private signInIfHasSavedData(): void {
        const syncSettings = this.getHistorySyncSettings();
        if (!!syncSettings.email && syncSettings.password) {
            this.signInUser(syncSettings)
                .pipe(tap<SignInResponse>(response => {
                    if (!response.isSuccessful) {
                        this.notificationSender.showNonCriticalError("Error singing in into a history account.", new Error(response.validationCode));
                    }
                }))
                .subscribe();
        }
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