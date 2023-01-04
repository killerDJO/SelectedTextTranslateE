import type { Settings } from '@selected-text-translate/common/settings/settings';

import { useAppStore } from '~/app.store';

export class SettingsProvider {
  public getSettings(): Settings {
    const appStore = useAppStore();
    return appStore.settings;
  }
}

export const settingsProvider = new SettingsProvider();
