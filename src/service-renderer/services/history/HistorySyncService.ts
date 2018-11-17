import { BehaviorSubject } from "rxjs";

import { MessageBus, Subscription } from "common/renderer/MessageBus";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { Messages } from "common/messaging/Messages";
import { SignRequest } from "common/dto/history/account/SignRequest";
import { ServerHistoryRecord } from "services/history/ServerHistoryRecord";
import { FirebaseSettings } from "common/dto/settings/FirebaseSettings";
import { HistorySyncSettings } from "common/dto/settings/HistorySyncSettings";
import { SignInResponse } from "common/dto/history/account/SignInResponse";
import { SignUpResponse } from "common/dto/history/account/SignUpResponse";
import { AccountInfo } from "common/dto/history/account/AccountInfo";
import { SyncRequest } from "common/dto/history/SyncRequest";
import { PasswordResetResponse } from "common/dto/history/account/PasswordResetResponse";
import { PasswordResetRequest } from "common/dto/history/account/PasswordResetRequest";
import { SendResetTokenResponse } from "common/dto/history/account/SendResetTokenResponse";
import { VerifyResetTokenResponse } from "common/dto/history/account/VerifyResetTokenResponse";
import { PasswordChangeRequest } from "common/dto/history/account/PasswordChangeRequest";
import { PasswordChangeResponse } from "common/dto/history/account/PasswordChangeResponse";

import { FirebaseClient } from "infrastructure/FirebaseClient";
import { Logger } from "infrastructure/Logger";
import { OutOfSyncError } from "infrastructure/OutOfSyncError";

export class HistorySyncService {
    private readonly messageBus: MessageBus = new MessageBus();
    private readonly firebaseClient: FirebaseClient = new FirebaseClient();
    private readonly logger: Logger = new Logger();

    private readonly collectionId: string = "history";

    private isContinuousSyncStarted: boolean = false;
    private observeRecordSubscription: Subscription | null = null;
    private continuousInterval: NodeJS.Timer | null = null;

    private readonly syncTask$: BehaviorSubject<Promise<void> | null> = new BehaviorSubject(null);
    private readonly currentUser$: BehaviorSubject<AccountInfo | null> = new BehaviorSubject(null);

    constructor() {
        this.messageBus.observeConstant<FirebaseSettings>(Messages.HistorySync.FirebaseSettings)
            .then(settings => {
                this.firebaseClient.initializeApp(settings);
                this.setupSubscriptions();
            });
    }

    private setupSubscriptions(): void {
        this.messageBus.observeValue<SignRequest, SignInResponse>(Messages.HistorySync.SignIn, async signInRequest => {
            const signInResponse = await this.firebaseClient.signIn(signInRequest.email, signInRequest.password);
            this.updateCurrentUser();
            return signInResponse;
        });

        this.messageBus.observeValue<SignRequest, SignUpResponse>(Messages.HistorySync.SignUp, async signInRequest => {
            const signUpResponse = this.firebaseClient.signUp(signInRequest.email, signInRequest.password);
            this.updateCurrentUser();
            return signUpResponse;
        });

        this.messageBus.observeValue<PasswordResetRequest, PasswordResetResponse>(Messages.HistorySync.ResetPassword, async resetRequest => {
            return this.firebaseClient.confirmPasswordReset(resetRequest.token, resetRequest.password);
        });

        this.messageBus.observeValue<string, SendResetTokenResponse>(Messages.HistorySync.SendPasswordResetToken, async email => {
            return this.firebaseClient.sendPasswordResetToken(email);
        });

        this.messageBus.observeValue<string, VerifyResetTokenResponse>(Messages.HistorySync.VerifyPasswordResetToken, async token => {
            return this.firebaseClient.verifyPasswordResetToken(token);
        });

        this.messageBus.observeValue<PasswordChangeRequest, PasswordChangeResponse>(Messages.HistorySync.ChangePassword, async passwordChangeRequest => {
            return this.firebaseClient.changePassword(passwordChangeRequest.oldPassword, passwordChangeRequest.newPassword);
        });

        this.messageBus.observeNotification(Messages.HistorySync.SignOut, async () => {
            this.stopSync();
            await this.waitForSyncToFinish();
            await this.firebaseClient.signOut();
            this.updateCurrentUser();
            this.logger.info("Sign out successful");
        });

        this.messageBus.observeNotification(Messages.HistorySync.StopSync, () => {
            if (this.isContinuousSyncStarted) {
                this.stopSync();
            }
        });

        this.messageBus.observeValue<SyncRequest>(Messages.HistorySync.StartSync, async (syncRequest: SyncRequest) => {
            if (!this.isContinuousSyncStarted || !syncRequest.isContinuous) {
                await this.startSync(syncRequest.isContinuous, syncRequest.isForcedPull);
            }
        });

        this.currentUser$.subscribe(user => this.messageBus.sendCommand(Messages.HistorySync.CurrentUser, user));
        this.syncTask$.subscribe(syncTask => this.messageBus.sendCommand(Messages.HistorySync.IsSyncInProgress, syncTask !== null));
    }

    private async startSync(isContinuous: boolean, isForcedPull: boolean): Promise<void> {
        const historySyncSettings = await this.messageBus.sendCommand<void, HistorySyncSettings>(Messages.HistorySync.HistorySyncSettings);

        if (this.firebaseClient.getAccountInfo() === null) {
            this.logger.warning("Unable to start sync. User must be signed in.");
            return;
        }

        await this.waitForSyncToFinish();

        if (isContinuous) {
            if (this.isContinuousSyncStarted) {
                return;
            }

            this.destroyObserveRecordSubscription();
            this.observeRecordSubscription = this.messageBus.observeValue<HistoryRecord>(Messages.HistorySync.HistoryRecord, historyRecord => this.syncSingleRecord(historyRecord));
            this.isContinuousSyncStarted = isContinuous;
        }

        this.logger.info("History records sync started.");

        this.syncRecords(historySyncSettings.interval, isContinuous, isForcedPull);
    }

    private stopSync(): void {
        this.destroyObserveRecordSubscription();

        if (this.continuousInterval !== null) {
            clearInterval(this.continuousInterval);
        }

        this.isContinuousSyncStarted = false;
        this.logger.info("History records sync stopped.");
    }

    private destroyObserveRecordSubscription(): void {
        if (this.observeRecordSubscription !== null) {
            this.observeRecordSubscription.unsubscribe();
            this.observeRecordSubscription = null;
        }
    }

    private updateCurrentUser(): void {
        this.currentUser$.next(this.firebaseClient.getAccountInfo());
    }

    private async syncRecords(syncInterval: number, isContinuous: boolean, isForcedPull: boolean): Promise<void> {
        try {
            await this.syncAllRecords(isForcedPull);
        } finally {
            if (this.isContinuousSyncStarted && isContinuous) {
                this.continuousInterval = setInterval(() => this.syncAllRecords(isForcedPull), syncInterval);
            }
        }
    }

    private async syncAllRecords(isForcedPull: boolean): Promise<void> {
        await this.waitForSyncToFinish();

        if (!this.canSync()) {
            return;
        }

        try {
            this.syncTask$.next(this.syncAllRecordsUnsafe(isForcedPull));
            await this.syncTask$.value;
        } finally {
            this.syncTask$.next(null);
        }
    }

    private async syncAllRecordsUnsafe(isForcedPull: boolean): Promise<void> {
        try {
            this.logger.info("Start history records sync.");
            this.logger.info("Start history records pull.");
            await this.pullRecords(isForcedPull);
            this.logger.info("End history records pull.");
            this.logger.info("Start history records push.");
            await this.pushRecords();
            this.logger.info("End history records push.");
            this.logger.info("End history records sync.");
        } catch (error) {
            this.logger.error("Error syncing records", error);
        }
    }

    private async syncSingleRecord(historyRecord: HistoryRecord): Promise<void> {
        await this.waitForSyncToFinish();

        if (!this.canSync()) {
            return;
        }

        if (!(await this.writeRecord(historyRecord))) {
            this.logger.info("Failed to sync individual record. Falling back to a full sync.");
            await this.syncAllRecords(false);
        }
    }

    private async pullRecords(isForcedPull: boolean): Promise<void> {
        const lastSyncTime = !isForcedPull ? await this.messageBus.sendCommand<void, string | undefined>(Messages.HistorySync.LastSyncTime) : undefined;
        const documents = await this.firebaseClient.getDocuments<ServerHistoryRecord>(this.collectionId, lastSyncTime);
        const accountInfo = this.firebaseClient.getAccountInfo();

        if (accountInfo === null) {
            throw new Error("Unable to sync when user is not signed in");
        }
        for (const document of documents) {
            const serverRecord = this.deserializeRecord(document.record);
            const historyRecord: HistoryRecord = {
                ...serverRecord,
                syncData: [
                    {
                        serverTimestamp: document.timestamp,
                        lastModifiedDate: serverRecord.lastModifiedDate,
                        serverTranslationsNumber: serverRecord.translationsNumber,
                        userEmail: accountInfo.email
                    }
                ]
            };
            await this.messageBus.sendCommand(Messages.HistorySync.MergeRecord, historyRecord);
        }
    }

    private async pushRecords(): Promise<void> {
        const historyRecords = await this.messageBus.sendCommand<void, HistoryRecord[]>(Messages.HistorySync.UnSyncedHistoryRecords);
        for (const record of historyRecords) {
            await this.writeRecord(record);
        }
    }

    private async writeRecord(record: HistoryRecord): Promise<boolean> {
        this.logger.info(`Write record with id ${record.id} to the server.`);

        if (!this.canSync()) {
            return false;
        }

        const sanitizedRecord = {
            id: record.id,
            sentence: record.sentence,
            isForcedTranslation: record.isForcedTranslation,
            sourceLanguage: record.sourceLanguage,
            targetLanguage: record.targetLanguage,
            translateResult: record.translateResult,
            translationsNumber: record.translationsNumber,
            createdDate: record.createdDate,
            updatedDate: record.updatedDate,
            lastTranslatedDate: record.lastTranslatedDate,
            lastModifiedDate: record.lastModifiedDate,
            isStarred: record.isStarred,
            isArchived: record.isArchived
        };
        const serializedRecord = this.serializeRecord(sanitizedRecord);

        const accountInfo = this.firebaseClient.getAccountInfo();
        if (accountInfo === null) {
            throw Error("Unable to sync when account is logged out.");
        }

        let existingServerTimestamp: string | undefined;
        if (record.syncData) {
            const existingSyncData = record.syncData.find(data => data.userEmail === accountInfo.email);

            if (!!existingSyncData) {
                existingServerTimestamp = existingSyncData.serverTimestamp;
            }
        }

        const firebasePromise = !existingServerTimestamp
            ? this.firebaseClient.addDocument(this.collectionId, record.id, { record: serializedRecord })
            : this.firebaseClient.updateDocument(this.collectionId, record.id, { record: serializedRecord }, existingServerTimestamp);

        try {
            const updatedTimestamp = await firebasePromise;
            const filteredSyncData = (record.syncData || []).filter(syncData => syncData.userEmail !== accountInfo.email);
            await this.messageBus.sendCommand<HistoryRecord>(Messages.HistorySync.UpdateRecord, {
                ...sanitizedRecord,
                id: record.id,
                syncData: [
                    ...filteredSyncData,
                    {
                        userEmail: accountInfo.email,
                        lastModifiedDate: record.lastModifiedDate,
                        serverTimestamp: updatedTimestamp,
                        serverTranslationsNumber: record.translationsNumber
                    }
                ]
            });
        } catch (error) {
            if (error instanceof OutOfSyncError) {
                this.logger.warning("Failed to write record. Records are out of sync.");
                return false;
            }

            this.logger.error("Error writing record", error);
        }

        return true;
    }

    private async waitForSyncToFinish(): Promise<void> {
        while (this.syncTask$.value !== null) {
            await this.syncTask$.value;
        }
    }

    private serializeRecord(record: HistoryRecord): string {
        return btoa(unescape(encodeURIComponent(JSON.stringify(record))));
    }

    private deserializeRecord(serializedRecord: string): HistoryRecord {
        return JSON.parse(decodeURIComponent(escape(atob(serializedRecord))));
    }

    private canSync(): boolean {
        if (!navigator.onLine) {
            this.logger.warning("Unable to sync records when offline.");
            return false;
        }

        return true;
    }
}