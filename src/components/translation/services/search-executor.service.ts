import { hostApi } from '~/host/host-api.service';
import { settingsProvider, SettingsProvider } from '~/services/settings-provider.service';
import { replacePattern } from '~/utils/pattern.utils';

export class SearchExecutor {
  public constructor(private readonly settingsProvider: SettingsProvider) {}

  public search(text: string): void {
    const settings = this.settingsProvider.getSettings();

    const encodedText = encodeURIComponent(text);
    const searchUrlPattern = settings.core.searchPattern;
    const searchUrl = replacePattern(searchUrlPattern, 'query', encodedText);
    hostApi.openUrl(searchUrl);
  }
}

export const searchExecutor = new SearchExecutor(settingsProvider);
