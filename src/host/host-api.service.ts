import { invoke } from '@tauri-apps/api/core';
import { listen, Event } from '@tauri-apps/api/event';
import { warn, info, error } from '@tauri-apps/plugin-log';

import { PartialSettings, Settings } from './models/settings.model';
import { ViewNames } from './models/views.model';

export class HostApi {
  getViewName(): ViewNames {
    return window.location.hash.slice(1) as ViewNames;
  }

  async getAccentColor(): Promise<string> {
    return invoke<string>('accent_color');
  }

  onAccentColorChange(_callback: (accentColor: string) => void): void {
    // TODO: not implemented
  }

  async getSettings(): Promise<Settings> {
    return invoke<Settings>('settings');
  }

  async updateSettings(updated_settings: PartialSettings): Promise<void> {
    await invoke('update_settings', { updated_settings: updated_settings });
  }

  onSettingsChange(callback: (settings: Settings) => void): void {
    listen('settings_changed', (event: Event<Settings>) => callback(event.payload));
  }

  notifyOnError(): void {
    invoke('notify_on_frontend_error');
  }

  logInfo(message: string): void {
    info(message);
  }

  logWarning(message: string): void {
    warn(message);
  }

  logError(err: Error, message: string): void {
    error(`Error: ${message}. Error details: ${err}. Stack: ${err.stack}.`);
  }
}

export const hostApi = new HostApi();
