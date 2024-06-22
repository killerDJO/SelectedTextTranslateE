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

export type TranslationCommand = 'Play' | 'ShowInput' | { Translate: boolean };

export class HostApi {
  getViewName(): ViewNames {
    return window.location.hash.slice(2) as ViewNames;
  }

  async onBeforeShow(callback: () => void): Promise<void> {
    await listen('before_show', () => callback());
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

  async updateSettings(updatedSettings: PartialSettings): Promise<void> {
    await invoke('update_settings', { updatedSettings: updatedSettings });
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

  async onTranslateText(callback: (showDefinitions: boolean) => void): Promise<void> {
    await listen('translate_text', (event: Event<{ show_definition: boolean }>) =>
      callback(event.payload.show_definition)
    );
  }

  async onPlayText(callback: () => void): Promise<void> {
    await listen('play_text', () => callback());
  }

  async onShowInput(callback: () => void): Promise<void> {
    await listen('show_input', () => callback());
  }

  async getTextFromClipboard(): Promise<string> {
    return invoke<string>('clipboard_text');
  }

  async getLastTranslationCommand(): Promise<TranslationCommand> {
    return invoke<TranslationCommand>('last_translation_command');
  }

  async executeGoogleTranslateRequest(url: string, body: string): Promise<string> {
    return invoke<string>('execute_google_translate_request', {
      url,
      body,
      userAgent: navigator.userAgent
    });
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

  async notifyOnError(message: string): Promise<void> {
    await invoke('notify_on_frontend_error', { message });
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
    error(`Error: ${message}. Error details: ${JSON.stringify(err)}. Stack: ${err.stack}.`);
  }
}

export const hostApi = new HostApi();
