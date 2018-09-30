import { FirebaseClient } from "infrastructure/FirebaseClient";
import { MessageBus } from "common/renderer/MessageBus";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { Messages } from "common/messaging/Messages";
import md5 = require("md5");
import { ServerHistoryRecord } from "history/ServerHistoryRecord";
import { FirebaseSettings } from "common/dto/settings/FirebaseSettings";
import { HistorySyncSettings } from "common/dto/settings/HistorySyncSettings";
import { Logger } from "infrastructure/Logger";

export class HistorySyncService {
    private readonly messageBus: MessageBus = new MessageBus();
    private readonly firebaseClient: FirebaseClient = new FirebaseClient();
    private readonly logger: Logger = new Logger();
    private readonly collectionId: string = "history";
    private isSyncInProgress: boolean = false;

    constructor() {
        this.messageBus.observeNotification(Messages.HistorySync.StartSync, () => {
            if (!this.isSyncInProgress) {
                this.startSync();
            }
        });
    }

    private startSync() {
        this.isSyncInProgress = true;
        this.logger.info("History records sync enabled.");

        Promise
            .all([
                this.messageBus.observeConstant<FirebaseSettings>(Messages.HistorySync.FirebaseSettings),
                this.messageBus.observeConstant<HistorySyncSettings>(Messages.HistorySync.HistorySyncSettings)])
            .then(([firebaseSettings, historySyncSettings]) => {
                this.firebaseClient.initializeApp(firebaseSettings, historySyncSettings.email, historySyncSettings.password)
                    .then(() => this.syncRecords(historySyncSettings.interval));
            });
    }

    private async syncRecords(syncInterval: number): Promise<void> {
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
        } finally {
            setTimeout(() => this.syncRecords(syncInterval), syncInterval);
        }
    }

    private async pullRecords(): Promise<void> {
        const documents = await this.firebaseClient.getDocuments<ServerHistoryRecord>(this.collectionId);
        documents.forEach(document => {
            const historyRecord: HistoryRecord = {
                ...this.deserializeRecord(document.record),
                serverTimestamp: document.timestamp,
                isSyncedWithServer: true
            };
            this.messageBus.sendCommand(Messages.HistorySync.MergeRecord, historyRecord);
        });
    }

    private async pushRecords(): Promise<void> {
        const historyRecords = await this.messageBus.getValue<HistoryRecord[], void>(Messages.HistorySync.HistoryRecords);
        for (const record of historyRecords) {
            await this.writeRecord(record);
        }
    }

    private async writeRecord(record: HistoryRecord): Promise<void> {
        const id = `${md5(record.sentence)}${record.isForcedTranslation ? "-forced" : ""}-${record.sourceLanguage}-${record.targetLanguage}`;
        const recordToSave = { ...record };
        delete recordToSave._id;
        delete recordToSave.serverTimestamp;

        const serializedRecord = this.serializeRecord({
            sentence: record.sentence,
            isForcedTranslation: record.isForcedTranslation,
            sourceLanguage: record.sourceLanguage,
            targetLanguage: record.targetLanguage,
            translateResult: record.translateResult,
            translationsNumber: record.translationsNumber,
            createdDate: record.createdDate,
            updatedDate: record.updatedDate,
            lastTranslatedDate: record.lastTranslatedDate,
            isStarred: record.isStarred,
            isArchived: record.isArchived
        });

        const firebasePromise = !record.serverTimestamp
            ? this.firebaseClient.addDocument(this.collectionId, id, { record: serializedRecord })
            : this.firebaseClient.updateDocument(this.collectionId, id, { record: serializedRecord }, record.serverTimestamp);

        try {
            const updatedTimestamp = await firebasePromise;
            this.messageBus.sendCommand<HistoryRecord>(Messages.HistorySync.UpdateRecord, {
                ...record,
                serverTimestamp: updatedTimestamp,
                isSyncedWithServer: true
            });
        } catch (error) {
            this.logger.error("Error writing record", error);
        }
    }

    private serializeRecord(record: HistoryRecord): string {
        return btoa(unescape(encodeURIComponent(JSON.stringify(record))));
    }

    private deserializeRecord(serializedRecord: string): HistoryRecord {
        return JSON.parse(decodeURIComponent(escape(atob(serializedRecord))));
    }
}