import { useAppStore } from '~/app.store';
import { Settings } from '~/host/models/settings.model';

export class SettingsProvider {
  public getSettings(): Settings {
    const app = useAppStore();
    return app.settings;
  }
}

export const settingsProvider = new SettingsProvider();
