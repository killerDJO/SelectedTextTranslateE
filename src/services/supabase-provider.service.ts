import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { settingsProvider, SettingsProvider } from '~/services/settings-provider.service';
import { logger, Logger } from '~/services/logger.service';

export class SupabaseProvider {
  private supabase: SupabaseClient | null = null;

  public constructor(
    private readonly settingsProvider: SettingsProvider,
    private readonly logger: Logger
  ) {}

  public async getClient<TDatabase = void>(): Promise<SupabaseClient<TDatabase>> {
    if (!this.supabase) {
      this.logger.info('Initializing Supabase client.');
      const settings = this.settingsProvider.getSettings().supabase;
      this.supabase = createClient(settings.projectUrl, settings.anonKey);
    }

    return this.supabase as SupabaseClient<TDatabase>;
  }
}

export const supabaseProvider = new SupabaseProvider(settingsProvider, logger);
