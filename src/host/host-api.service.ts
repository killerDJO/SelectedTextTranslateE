import { invoke } from '@tauri-apps/api/core';
import { listen, Event, emit } from '@tauri-apps/api/event';
import { warn, info, error } from '@tauri-apps/plugin-log';
import { open } from '@tauri-apps/plugin-shell';
import { window as tauriWindow } from '@tauri-apps/api';
import { getVersion } from '@tauri-apps/api/app';
import { check } from '@tauri-apps/plugin-updater';
import {
  enable as enableAutostart,
  isEnabled as isAutostartEnabled,
  disable as disableAutostart
} from '@tauri-apps/plugin-autostart';
import { getCurrentWebview } from '@tauri-apps/api/webview';

import { PartialSettings, Settings } from './models/settings.model';
import { ViewNames } from './models/views.model';

const HISTORY_RECORD_CHANGE_EVENT = 'history_record_changed';
const SHOW_ON_LOAD_QUERY_PARAM = 'show_on_load';

export type TranslationCommand = 'Play' | 'ShowInput' | { Translate: boolean };

export const hostApi = {
  view: {
    getViewName(): ViewNames {
      const urlParams = new URLSearchParams(window.location.search);
      const viewName = urlParams.get('view');

      return viewName as ViewNames;
    },

    async onBeforeShow(callback: () => void): Promise<void> {
      await listen('before_show', () => callback());
    },

    async getAccentColor(): Promise<string> {
      return invoke<string>('accent_color');
    },

    async onAccentColorChange(callback: (accentColor: string) => void): Promise<void> {
      await listen('accent_color_changed', (event: Event<string>) => callback(event.payload));
    },

    async hideWindow(): Promise<void> {
      await tauriWindow.getCurrentWindow().hide();
      // Show loader for next time
      emit('before_show');
    },

    shouldShowOnLoad(): boolean {
      const urlParams = new URLSearchParams(window.location.search);
      const initiallyHidden = urlParams.get(SHOW_ON_LOAD_QUERY_PARAM);
      return initiallyHidden === true.toString();
    },

    async showWindowOnLoad(): Promise<void> {
      await tauriWindow.getCurrentWindow().show();
      await tauriWindow.getCurrentWindow().setFocus();

      // Remove param to prevent showing on reload
      const url = new URL(window.location.href);
      url.searchParams.delete(SHOW_ON_LOAD_QUERY_PARAM);
      window.history.replaceState(null, '', url.toString());
    },

    async setZoom(zoom: number) {
      await getCurrentWebview().setZoom(zoom);
    }
  },

  settings: {
    async getSettings(): Promise<Settings> {
      return invoke<Settings>('settings');
    },

    async getDefaultSettings(): Promise<Settings> {
      return invoke<Settings>('default_settings');
    },

    async updateSettings(updatedSettings: PartialSettings): Promise<void> {
      await invoke('update_settings', { updatedSettings: updatedSettings });
    },

    async resetSettingsToDefault(): Promise<void> {
      await invoke('reset_settings_to_default');
    },

    async openSettingsFile(): Promise<void> {
      await invoke('open_settings_file');
    },

    async onSettingsChange(callback: (settings: Settings) => void): Promise<void> {
      await listen('settings_changed', (event: Event<Settings>) => callback(event.payload));
    }
  },

  globalHotkeys: {
    async pauseHotkeys(): Promise<void> {
      await emit('pause_hotkeys');
    },

    async resumeHotkeys(): Promise<void> {
      await emit('resume_hotkeys');
    }
  },

  translation: {
    async onTranslateText(callback: (showDefinitions: boolean) => void): Promise<void> {
      await listen('translate_text', (event: Event<{ show_definition: boolean }>) =>
        callback(event.payload.show_definition)
      );
    },

    async onPlayText(callback: () => void): Promise<void> {
      await listen('play_text', () => callback());
    },

    async onShowInput(callback: () => void): Promise<void> {
      await listen('show_input', () => callback());
    },

    async getTextFromClipboard(): Promise<string> {
      return invoke<string>('clipboard_text');
    },

    async getLastTranslationCommand(): Promise<TranslationCommand> {
      return invoke<TranslationCommand>('last_translation_command');
    },

    async executeGoogleTranslateRequest(url: string, body: string): Promise<string> {
      return invoke<string>('execute_google_translate_request', {
        url,
        body,
        userAgent: navigator.userAgent
      });
    },

    async setPlayingState(isPlaying: boolean): Promise<void> {
      if (isPlaying) {
        await emit('play_start');
      } else {
        await emit('play_stop');
      }
    },

    async emitHistoryRecordChangeEvent(recordId: string): Promise<void> {
      await emit(HISTORY_RECORD_CHANGE_EVENT, { recordId });
    },

    async onHistoryRecordChange(callback: (recordId: string) => void): Promise<void> {
      await listen(HISTORY_RECORD_CHANGE_EVENT, (event: Event<{ recordId: string }>) =>
        callback(event.payload.recordId)
      );
    }
  },

  startup: {
    getStartupState(): Promise<boolean> {
      return isAutostartEnabled();
    },

    updateStartupState(enabled: boolean): Promise<void> {
      if (enabled) {
        return enableAutostart();
      } else {
        return disableAutostart();
      }
    }
  },

  notifications: {
    async showNotification(message: string, body?: string): Promise<void> {
      await invoke('show_notification', { message, body });
    },

    async showErrorNotification(message: string): Promise<void> {
      await invoke('show_notification', { message, body: 'Details can be found in log' });
    }
  },

  updater: {
    async getVersion(): Promise<string> {
      return getVersion();
    },

    async checkForUpdates(): Promise<void> {
      const update = await check();
      if (update) {
        await hostApi.notifications.showNotification('Update is available. Downloading...');
        await update.downloadAndInstall();
      } else {
        await hostApi.notifications.showNotification('No updates available.');
      }
    }
  },

  logging: {
    logInfo(message: string): void {
      info(message);
    },

    logWarning(message: string): void {
      warn(message);
    },

    logError(err: Error, message: string): void {
      error(`Message: [${message}] Error Message: [${err.message}] Stack: [${err.stack}]`);
    }
  },

  async openUrl(url: string): Promise<void> {
    await open(url);
  }
};
