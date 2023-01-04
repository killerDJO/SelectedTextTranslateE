import { initializeApp } from 'firebase/app';
import {
  collection,
  Firestore,
  getDocs,
  getFirestore,
  query,
  where,
  orderBy,
  startAfter,
  type DocumentData,
  Query,
  doc,
  DocumentSnapshot,
  setDoc,
  initializeFirestore
} from '@firebase/firestore';

import {
  authService,
  type AuthService
} from '~/components/history/history-auth/services/auth-service';
import type { HistoryRecord } from '~/components/history/models/history-record';
import { settingsProvider, SettingsProvider } from '~/services/settings-provider';
import { logger, type Logger } from '~/services/logger';

const HISTORY_COLLECTION = 'history_v2';

export class HistoryDatabase {
  private db: Firestore | null = null;

  constructor(
    private readonly settingsProvider: SettingsProvider,
    private readonly authService: AuthService,
    private readonly logger: Logger
  ) {}

  public async getRecords(afterTimestamp: number): Promise<HistoryRecord[]> {
    this.logger.info(`Getting history records after timestamp: ${afterTimestamp}`);

    const q = await this.createQuery(afterTimestamp);

    const querySnapshot = await getDocs(q);

    this.logger.info(`Returned records: ${querySnapshot.docs.length}`);
    return querySnapshot.docs.map(doc => this.mapHistoryRecord(doc));
  }

  public async upsertRecord(record: HistoryRecord): Promise<void> {
    this.logger.info(`Upserting history record ${record.id}.`);

    const db = await this.ensureInitialized();

    const recordRef = doc(db, HISTORY_COLLECTION, record.id);
    const recordData: any = { ...record };
    delete recordData.id;

    await setDoc(recordRef, recordData);
  }

  private mapHistoryRecord(doc: DocumentSnapshot<DocumentData>): HistoryRecord {
    return {
      id: doc.id,
      ...doc.data()
    } as HistoryRecord;
  }

  private async createQuery(timestamp: number): Promise<Query<DocumentData>> {
    const db = await this.ensureInitialized();

    const recordsRef = collection(db, HISTORY_COLLECTION);

    return query(
      recordsRef,
      where('user', '==', await this.getUserId()),
      orderBy('updatedDate'),
      startAfter(timestamp)
    );
  }

  private async getUserId(): Promise<string> {
    const user = await this.authService.getAccount();
    if (!user) {
      throw new Error('Unauthorized');
    }

    return user.uid;
  }

  private ensureInitialized(): Firestore {
    if (!this.db) {
      const settings = this.settingsProvider.getSettings().firebase;
      const app = initializeApp({
        apiKey: settings.apiKey,
        authDomain: settings.authDomain,
        projectId: settings.projectId
      });
      initializeFirestore(app, { ignoreUndefinedProperties: true });
      this.db = getFirestore(app);
    }

    return this.db;
  }
}

export const historyDatabase = new HistoryDatabase(settingsProvider, authService, logger);
