import { FirebaseClient } from "infrastructure/FirebaseClient";
import { MessageBus } from "common/renderer/MessageBus";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { Messages } from "common/messaging/Messages";
import { ServerHistoryRecord } from "history/ServerHistoryRecord";
import { FirebaseSettings } from "common/dto/settings/FirebaseSettings";
import { HistorySyncSettings } from "common/dto/settings/HistorySyncSettings";
import { Logger } from "infrastructure/Logger";
import { OutOfSyncError } from "infrastructure/OutOfSyncError";

export class HistorySyncService {
    private readonly messageBus: MessageBus = new MessageBus();
    private readonly firebaseClient: FirebaseClient = new FirebaseClient();
    private readonly logger: Logger = new Logger();

    private readonly collectionId: string = "history";

    private isSyncStarted: boolean = false;
    private syncTask: Promise<void> | null = null;

    constructor() {
        this.messageBus.observeNotification(Messages.HistorySync.StartSync, () => {
            if (!this.isSyncStarted) {
                this.startSync();
            }
        });
    }

    private startSync() {
        this.isSyncStarted = true;
        this.logger.info("History records sync started.");

        Promise
            .all([
                this.messageBus.observeConstant<FirebaseSettings>(Messages.HistorySync.FirebaseSettings),
                this.messageBus.observeConstant<HistorySyncSettings>(Messages.HistorySync.HistorySyncSettings)])
            .then(([firebaseSettings, historySyncSettings]) => {
                this.firebaseClient
                    .initializeApp(firebaseSettings, historySyncSettings.email, historySyncSettings.password)
                    .then(() => this.syncRecords(historySyncSettings.interval));
            });
    }

    private async syncRecords(syncInterval: number): Promise<void> {
        this.messageBus.observeValue<HistoryRecord>(Messages.HistorySync.HistoryRecord, historyRecord => this.syncSingleRecord(historyRecord));

        try {
            await this.syncAllRecords();
        } finally {
            setTimeout(() => this.syncAllRecords(), syncInterval);
        }
    }

    private async syncAllRecords(): Promise<void> {
        await this.waitForSyncToFinish();

        try {
            this.syncTask = this.syncAllRecordsUnsafe();
            await this.syncTask;
        } finally {
            this.syncTask = null;
        }
    }

    private async syncAllRecordsUnsafe(): Promise<void> {
        try {
            this.logger.info("Start history records sync.");
            this.logger.info("Start history records pull.");
            await this.pullRecords();
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

        if (await this.writeRecord(historyRecord)) {
            this.logger.info("Failed to sync individual record. Falling back to a full sync.");
            await this.syncAllRecords();
        }
    }

    private async pullRecords(): Promise<void> {
        const documents = await this.firebaseClient.getDocuments<ServerHistoryRecord>(this.collectionId);
        for (const document of documents) {
            const historyRecord: HistoryRecord = {
                ...this.deserializeRecord(document.record),
                serverTimestamp: document.timestamp,
                isSyncedWithServer: true
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

        const firebasePromise = !record.serverTimestamp
            ? this.firebaseClient.addDocument(this.collectionId, record.id, { record: serializedRecord })
            : this.firebaseClient.updateDocument(this.collectionId, record.id, { record: serializedRecord }, record.serverTimestamp);

        try {
            const updatedTimestamp = await firebasePromise;
            await this.messageBus.sendCommand<HistoryRecord>(Messages.HistorySync.UpdateRecord, {
                ...sanitizedRecord,
                id: record.id,
                serverTimestamp: updatedTimestamp,
                isSyncedWithServer: true
            });
        } catch (error) {
            if (error instanceof OutOfSyncError) {
                this.logger.warning("Failed to write record. Records are out of sync.");
                return true;
            }

            this.logger.error("Error writing record", error);
        }

        return false;
    }

    private async waitForSyncToFinish(): Promise<void> {
        while (this.syncTask !== null) {
            await this.syncTask;
        }
    }

    private serializeRecord(record: HistoryRecord): string {
        return btoa(unescape(encodeURIComponent(JSON.stringify(record))));
    }

    private deserializeRecord(serializedRecord: string): HistoryRecord {
        return JSON.parse(decodeURIComponent(escape(atob(serializedRecord))));
    }
}