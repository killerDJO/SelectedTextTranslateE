import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';

import type {
  HistoryRecord,
  TranslationInstance
} from '~/components/history/models/history-record.model';
import { logger, type Logger } from '~/services/logger.service';
import { TranslateResult } from '~/components/translation/models/translation.model';
import { supabaseProvider, SupabaseProvider } from '~/services/supabase-provider.service';

import { Database, Json, Tables } from './database.generated';

export class HistoryDatabase {
  constructor(
    private readonly supabaseProvider: SupabaseProvider,
    private readonly logger: Logger
  ) {}

  public async getRecords(afterTimestamp: number): Promise<HistoryRecord[]> {
    this.logger.info(`[DB]: Getting history records after timestamp: ${afterTimestamp}`);
    const supabase = await this.supabaseProvider.getClient<Database>();

    let historyRecords: Tables<'history'>[] = [];
    const limit = 1000;
    const records = await this.fetchRecordsPage(supabase, afterTimestamp, 0, limit, 'exact');

    historyRecords = historyRecords.concat(records.data ?? []);

    this.logger.info(`[DB]: Returned records: ${records.data?.length ?? 0}`);

    if (records.count && records.count > limit) {
      this.logger.info(`[DB]: More than ${limit} records returned. Fetching rest in chunks.`);
      for (let from = limit; from < records.count; from += limit) {
        // Limit is exclusive
        const to = from + limit;
        const records = await this.fetchRecordsPage(supabase, afterTimestamp, from, to);

        historyRecords = historyRecords.concat(records.data ?? []);

        this.logger.info(
          `[DB]: Returned records: ${records.data?.length ?? 0} in range ${from}-${to}.`
        );
      }
    }

    return historyRecords.map(record => this.mapToHistoryRecord(record));
  }

  public async getRecord(id: string): Promise<HistoryRecord | undefined> {
    this.logger.info(`[DB]: Getting history record: ${id}`);
    const supabase = await this.supabaseProvider.getClient<Database>();

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
    const supabase = await this.supabaseProvider.getClient<Database>();

    await supabase.from('history').upsert(this.mapFromHistoryRecord(record)).throwOnError();
  }

  public async deleteRecord(id: string): Promise<void> {
    this.logger.info(`[DB]: Deleting history record ${id}.`);
    const supabase = await this.supabaseProvider.getClient<Database>();

    await supabase.from('history').delete().eq('id', id).throwOnError();
  }

  private async fetchRecordsPage(
    supabase: SupabaseClient<Database>,
    afterTimestamp: number,
    from: number,
    to: number,
    count?: 'exact'
  ): Promise<PostgrestSingleResponse<Tables<'history'>[]>> {
    const response = await supabase
      .from('history')
      .select('*', { count: count })
      .gt('updated_at', new Date(afterTimestamp).toISOString())
      .order('updated_at', { ascending: true })
      .range(from, to)
      .throwOnError();
    return response;
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
}

export const historyDatabase = new HistoryDatabase(supabaseProvider, logger);
