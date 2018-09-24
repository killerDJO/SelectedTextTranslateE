import { FirebaseClient } from "infrastructure/FirebaseClient";
import { MessageBus } from "common/renderer/MessageBus";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { Messages } from "common/messaging/Messages";
import md5 = require("md5");
import { ServerHistoryRecord } from "history/ServerHistoryRecord";

export class HistorySyncService {
    private readonly messageBus: MessageBus = new MessageBus();
    private readonly firebaseClient: FirebaseClient = new FirebaseClient();
    private readonly collectionId: string = "history";

    constructor() {
        this.firebaseClient.initializeApp().then(() => this.syncRecords());
    }

    private async syncRecords(): Promise<void> {
        try {
            await this.pullRecords();
            await this.pushRecords();
        } finally {
            const SyncInterval: number = 5 * 60 * 1000;
            setTimeout(() => this.syncRecords(), SyncInterval);
        }
    }

    private async pullRecords(): Promise<void> {
        const documents = await this.firebaseClient.getDocuments<ServerHistoryRecord>(this.collectionId);
        documents.forEach(document => {
            const historyRecord: HistoryRecord = {
                ...this.deserializeRecord(document.record),
                serverTimestamp: document.timestamp
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
            console.error("Error writing record", error);
        }
    }

    private serializeRecord(record: HistoryRecord): string {
        return btoa(unescape(encodeURIComponent(JSON.stringify(record))));
    }

    private deserializeRecord(serializedRecord: string): HistoryRecord {
        return JSON.parse(decodeURIComponent(escape(atob(serializedRecord))));
    }
}