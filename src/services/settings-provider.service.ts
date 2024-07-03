import { useAppStore } from '~/app.store';
import { Settings } from '~/host/models/settings.model';
import languages from '~/languages.json';

export class SettingsProvider {
  public getSettings(): Settings {
    const app = useAppStore();
    return app.settings;
  }

  public getLanguages(): Map<string, string> {
    const languagesMap = new Map<string, string>();
    for (const language of languages) {
      languagesMap.set(language.code, language.name);
    }

    return languagesMap;
  }
}

export const settingsProvider = new SettingsProvider();
