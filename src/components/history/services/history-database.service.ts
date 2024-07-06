import { createClient, SupabaseClient } from '@supabase/supabase-js';

import {
  authService,
  type AuthService
} from '~/components/history/history-auth/services/auth.service';
import type {
  HistoryRecord,
  TranslationInstance
} from '~/components/history/models/history-record.model';
import { settingsProvider, SettingsProvider } from '~/services/settings-provider.service';
import { logger, type Logger } from '~/services/logger.service';
import { TranslateResult } from '~/components/translation/models/translation.model';

import { Database, Json, Tables } from './database.types';

export class HistoryDatabase {
  private supabase: SupabaseClient<Database>;

  constructor(
    private readonly settingsProvider: SettingsProvider,
    private readonly authService: AuthService,
    private readonly logger: Logger
  ) {
    const supabaseSettings = this.settingsProvider.getSettings().supabase;
    this.supabase = createClient<Database>(supabaseSettings.projectUrl, supabaseSettings.anonKey);
  }

  public async getRecords(afterTimestamp: number): Promise<HistoryRecord[]> {
    this.logger.info(`[DB]: Getting history records after timestamp: ${afterTimestamp}`);

    const records = await this.supabase
      .from('history')
      .select('*')
      .gt('updatedDate', afterTimestamp)
      .order('updatedDate', { ascending: true });
    this.logger.info(`[DB]: Returned records: ${records.count}`);

    return records.data?.map(doc => this.mapToHistoryRecord(doc)) ?? [];
  }

  public async getRecord(id: string): Promise<HistoryRecord | undefined> {
    this.logger.info(`[DB]: Getting history record: ${id}`);

    const record = await this.supabase.from('history').select('*').eq('id', id).single();

    if (!record.data) {
      return undefined;
    }

    return this.mapToHistoryRecord(record.data);
  }

  public async upsertRecord(record: HistoryRecord): Promise<void> {
    this.logger.info(`[DB]: Upserting history record ${record.id}.`);

    await this.supabase.from('history').upsert(this.mapFromHistoryRecord(record));
  }

  public async deleteRecord(id: string): Promise<void> {
    this.logger.info(`[DB]: Deleting history record ${id}.`);

    await this.supabase.from('history').delete().eq('id', id);
  }

  private mapToHistoryRecord(data: Tables<'history'>): HistoryRecord {
    return {
      id: data.id,
      sentence: data.sentence,
      isForcedTranslation: data.forcedTranslation,
      sourceLanguage: data.sourceLanguage,
      targetLanguage: data.targetLanguage,
      translateResult: data.translate_result as unknown as TranslateResult,
      translationsNumber: data.translations_number,
      createdDate: new Date(data.created_at).getTime(),
      updatedDate: new Date(data.updated_at).getTime(),
      lastTranslatedDate: new Date(data.last_translated_date).getTime(),
      lastModifiedDate: new Date(data.last_modified_date).getTime(),
      isStarred: data.starred,
      isArchived: data.archived,
      tags: data.tags ?? [],
      blacklistedMergeRecords: data.blacklisted_merge_records ?? [],
      user: data.user_id,
      instances: data.instances as unknown as TranslationInstance[]
    };
  }

  private mapFromHistoryRecord(data: HistoryRecord): Tables<'history'> {
    return {
      id: data.id,
      sentence: data.sentence,
      forcedTranslation: data.isForcedTranslation,
      sourceLanguage: data.sourceLanguage,
      targetLanguage: data.targetLanguage,
      translate_result: data.translateResult as unknown as Json,
      translations_number: data.translationsNumber,
      created_at: new Date(data.createdDate).toISOString(),
      updated_at: new Date(data.updatedDate).toISOString(),
      last_translated_date: new Date(data.lastTranslatedDate).toISOString(),
      last_modified_date: new Date(data.lastModifiedDate).toISOString(),
      starred: data.isStarred,
      archived: data.isArchived,
      tags: data.tags?.slice() ?? null,
      blacklisted_merge_records: data.blacklistedMergeRecords?.slice() ?? null,
      user_id: data.user,
      instances: data.instances as unknown as Json
    };
  }

  private async getUserId(): Promise<string> {
    const user = await this.authService.getAccount();
    if (!user) {
      throw new Error('Unauthorized');
    }

    return user.uid;
  }
}

export const historyDatabase = new HistoryDatabase(settingsProvider, authService, logger);
