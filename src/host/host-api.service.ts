import { invoke } from '@tauri-apps/api/core';
import { listen, Event, emit } from '@tauri-apps/api/event';
import { warn, info, error } from '@tauri-apps/plugin-log';
import { open } from '@tauri-apps/plugin-shell';
import { window as tauriWindow } from '@tauri-apps/api';

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

  setPlayingState(isPlaying: boolean): void {
    if (isPlaying) {
      emit('play_start');
    } else {
      emit('play_stop');
    }
  }

  emitHistoryRecordChangeEvent(recordId: string): void {
    emit(HISTORY_RECORD_CHANGE_EVENT, { recordId });
  }

  onHistoryRecordChange(callback: (recordId: string) => void): void {
    listen(HISTORY_RECORD_CHANGE_EVENT, (event: Event<{ recordId: string }>) =>
      callback(event.payload.recordId)
    );
  }

  notifyOnError(): void {
    invoke('notify_on_frontend_error');
  }

  openUrl(url: string): void {
    open(url);
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
