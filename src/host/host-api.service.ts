import { invoke } from '@tauri-apps/api/core';
import { listen, Event, emit } from '@tauri-apps/api/event';
import { warn, info, error } from '@tauri-apps/plugin-log';
import { open } from '@tauri-apps/plugin-shell';
import { window as tauriWindow } from '@tauri-apps/api';
import {
  enable as enableAutostart,
  isEnabled as isAutostartEnabled,
  disable as disableAutostart
} from '@tauri-apps/plugin-autostart';

import { PartialSettings, Settings } from './models/settings.model';
import { ViewNames } from './models/views.model';

const HISTORY_RECORD_CHANGE_EVENT = 'history_record_changed';

export class HostApi {
  getViewName(): ViewNames {
    return window.location.hash.slice(1) as ViewNames;
  }

  async getAccentColor(): Promise<string> {
    return invoke<string>('accent_color');
  }

  async onAccentColorChange(_callback: (accentColor: string) => void): Promise<void> {
    // TODO: not implemented
  }

  async getSettings(): Promise<Settings> {
    return invoke<Settings>('settings');
  }

  async getDefaultSettings(): Promise<Settings> {
    return invoke<Settings>('default_settings');
  }

  async updateSettings(updated_settings: PartialSettings): Promise<void> {
    await invoke('update_settings', { updated_settings: updated_settings });
  }

  async resetSettingsToDefault(): Promise<void> {
    await invoke('reset_settings_to_default');
  }

  async openSettingsFile(): Promise<void> {
    await invoke('open_settings_file');
  }

  async pauseHotkeys(): Promise<void> {
    await emit('pause_hotkeys');
  }

  async resumeHotkeys(): Promise<void> {
    await emit('resume_hotkeys');
  }

  async onSettingsChange(callback: (settings: Settings) => void): Promise<void> {
    await listen('settings_changed', (event: Event<Settings>) => callback(event.payload));
  }

  async setPlayingState(isPlaying: boolean): Promise<void> {
    if (isPlaying) {
      await emit('play_start');
    } else {
      await emit('play_stop');
    }
  }

  async emitHistoryRecordChangeEvent(recordId: string): Promise<void> {
    await emit(HISTORY_RECORD_CHANGE_EVENT, { recordId });
  }

  async onHistoryRecordChange(callback: (recordId: string) => void): Promise<void> {
    await listen(HISTORY_RECORD_CHANGE_EVENT, (event: Event<{ recordId: string }>) =>
      callback(event.payload.recordId)
    );
  }

  getStartupState(): Promise<boolean> {
    return isAutostartEnabled();
  }

  updateStartupState(enabled: boolean): Promise<void> {
    if (enabled) {
      return enableAutostart();
    } else {
      return disableAutostart();
    }
  }

  async notifyOnError(): Promise<void> {
    await invoke('notify_on_frontend_error');
  }

  async openUrl(url: string): Promise<void> {
    await open(url);
  }

  hideWindow(): Promise<void> {
    return tauriWindow.getCurrent().hide();
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
