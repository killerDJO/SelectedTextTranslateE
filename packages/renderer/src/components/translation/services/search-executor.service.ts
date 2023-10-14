import { replacePattern } from '@selected-text-translate/common';

import { settingsProvider, SettingsProvider } from '~/services/settings-provider.service';

export class SearchExecutor {
  public constructor(private readonly settingsProvider: SettingsProvider) {}

  public search(text: string): void {
    const settings = this.settingsProvider.getSettings();

    const encodedText = encodeURIComponent(text);
    const searchUrlPattern = settings.search.searchPattern;
    const searchUrl = replacePattern(searchUrlPattern, 'query', encodedText);
    window.mainAPI.core.openUrl(searchUrl);
  }
}

export const searchExecutor = new SearchExecutor(settingsProvider);
