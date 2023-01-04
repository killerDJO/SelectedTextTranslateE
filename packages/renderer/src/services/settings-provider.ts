import type { Settings } from '@selected-text-translate/common/settings/settings';

import { useAppStore } from '~/app.store';

export class SettingsProvider {
  public getSettings(): Settings {
    const app = useAppStore();
    return app.settings;
  }
}

export const settingsProvider = new SettingsProvider();
