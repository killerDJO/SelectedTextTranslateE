import { defineStore } from 'pinia';
import { cloneDeep } from 'lodash-es';

import { useAppStore } from '~/app.store';
import { DeepPartial, Settings } from '~/host/models/settings.model';
import { hostApi } from '~/host/host-api.service';

import type { EditableHotkeySettings } from './models/editable-hotkey-settings.model';

interface SettingsState {
  defaultSettings: Settings | null;
  isStartupEnabled: boolean;
}

export const useSettingsStore = defineStore('settings', {
  state: () => {
    const state: SettingsState = {
      defaultSettings: null,
      isStartupEnabled: false
    };
    return state;
  },
  getters: {
    settings: () => useAppStore().settings,
    hotkeySettings: () => {
      const settings = useAppStore().settings;
      return mapHotkeySettingsToEditable(settings);
    },
    defaultHotkeySettings: state => {
      if (!state.defaultSettings) {
        throw new Error("Settings aren't initialized");
      }
      return mapHotkeySettingsToEditable(state.defaultSettings);
    }
  },
  actions: {
    async setup() {
      this.defaultSettings = await hostApi.getDefaultSettings();
      this.isStartupEnabled = await hostApi.getStartupState();
    },
    async updateSettings(settings: DeepPartial<Settings>) {
      await hostApi.updateSettings(cloneDeep(settings));
    },
    async updateHotkeys(hotkeySettings: EditableHotkeySettings) {
      this.updateSettings(mapEditableHotkeysToSettings(hotkeySettings));
    },
    async pauseHotkeys() {
      await window.mainAPI.settings.pauseHotkeys(true);
    },
    async enableHotkeys() {
      await window.mainAPI.settings.pauseHotkeys(false);
    },
    async openSettingsFile() {
      await window.mainAPI.settings.openSettingsFile();
    },
    async resetSettings() {
      await hostApi.resetSettingsToDefault();
    },
    async updateStartupState(isEnabled: boolean) {
      await hostApi.updateStartupState(isEnabled);
    }
  }
});

function mapHotkeySettingsToEditable(settings: Settings): EditableHotkeySettings {
  return {
    global: {
      playText: settings.hotkeys.playText,
      translate: settings.hotkeys.translate,
      showDefinition: settings.hotkeys.showDefinition,
      inputText: settings.hotkeys.inputText,
      toggleSuspend: settings.hotkeys.toggleSuspend
    },
    local: {
      zoomIn: settings.hotkeys.zoomIn,
      zoomOut: settings.hotkeys.zoomOut,
      resetZoom: settings.hotkeys.resetZoom,
      toggleDefinition: settings.hotkeys.toggleDefinition,
      archiveResult: settings.hotkeys.archiveResult,
      toggleTags: settings.hotkeys.toggleTags,
      addTag: settings.hotkeys.addTag
    }
  };
}

function mapEditableHotkeysToSettings(
  hotkeySettings: EditableHotkeySettings
): DeepPartial<Settings> {
  return {
    hotkeys: {
      playText: hotkeySettings.global.playText,
      translate: hotkeySettings.global.translate,
      showDefinition: hotkeySettings.global.showDefinition,
      inputText: hotkeySettings.global.inputText,
      toggleSuspend: hotkeySettings.global.toggleSuspend,
      zoomIn: hotkeySettings.local.zoomIn,
      zoomOut: hotkeySettings.local.zoomOut,
      resetZoom: hotkeySettings.local.resetZoom,
      toggleDefinition: hotkeySettings.local.toggleDefinition,
      archiveResult: hotkeySettings.local.archiveResult,
      toggleTags: hotkeySettings.local.toggleTags,
      addTag: hotkeySettings.local.addTag
    }
  };
}
