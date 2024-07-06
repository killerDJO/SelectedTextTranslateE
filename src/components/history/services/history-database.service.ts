import { createClient, SupabaseClient } from '@supabase/supabase-js';

import type {
  HistoryRecord,
  TranslationInstance
} from '~/components/history/models/history-record.model';
import { settingsProvider, SettingsProvider } from '~/services/settings-provider.service';
import { logger, type Logger } from '~/services/logger.service';
import { TranslateResult } from '~/components/translation/models/translation.model';

import { Database, Json, Tables } from './database.generated';

export class HistoryDatabase {
  private supabase: SupabaseClient<Database> | null = null;

  constructor(
    private readonly settingsProvider: SettingsProvider,
    private readonly logger: Logger
  ) {}

  public async getRecords(afterTimestamp: number): Promise<HistoryRecord[]> {
    this.logger.info(`[DB]: Getting history records after timestamp: ${afterTimestamp}`);
    const supabase = this.ensureInitialized();

    const records = await supabase
      .from('history')
      .select('*')
      .gt('updated_at', new Date(afterTimestamp).toISOString())
      .order('updated_at', { ascending: true })
      .throwOnError();

    this.logger.info(`[DB]: Returned records: ${records.data?.length ?? 0}`);

    return records.data?.map(doc => this.mapToHistoryRecord(doc)) ?? [];
  }

  public async getRecord(id: string): Promise<HistoryRecord | undefined> {
    this.logger.info(`[DB]: Getting history record: ${id}`);
    const supabase = this.ensureInitialized();

    const record = await supabase
      .from('history')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .throwOnError();

    if (!record.data) {
      return undefined;
    }

    return this.mapToHistoryRecord(record.data);
  }

  public async upsertRecord(record: HistoryRecord): Promise<void> {
    this.logger.info(`[DB]: Upserting history record ${record.id}.`);
    const supabase = this.ensureInitialized();

    await supabase.from('history').upsert(this.mapFromHistoryRecord(record)).throwOnError();
  }

  public async deleteRecord(id: string): Promise<void> {
    this.logger.info(`[DB]: Deleting history record ${id}.`);
    const supabase = this.ensureInitialized();

    await supabase.from('history').delete().eq('id', id).throwOnError();
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

  // Lazy initialization is needed to make sure settings are loaded before the database is initialized.
  private ensureInitialized(): SupabaseClient<Database> {
    if (!this.supabase) {
      const supabaseSettings = this.settingsProvider.getSettings().supabase;
      this.supabase = createClient<Database>(supabaseSettings.projectUrl, supabaseSettings.anonKey);
    }

    return this.supabase;
  }
}

export const historyDatabase = new HistoryDatabase(settingsProvider, logger);
