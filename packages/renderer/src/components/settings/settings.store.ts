import { defineStore } from 'pinia';
import { cloneDeep } from 'lodash-es';

import type { Settings, DeepPartial, SettingsGroup } from '@selected-text-translate/common';

import { useAppStore } from '~/app.store';

import type { EditableHotkeySettings } from './models/editable-hotkey-settings.model';

interface SettingsState {
  defaultSettings: Settings | null;
  currentSettingsGroup: SettingsGroup | null;
  isStartupEnabled: boolean;
}

export const useSettingsStore = defineStore('settings', {
  state: () => {
    const state: SettingsState = {
      defaultSettings: null,
      currentSettingsGroup: null,
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
      this.defaultSettings = await window.mainAPI.settings.getDefaultSettings();
      this.isStartupEnabled = await window.mainAPI.settings.getStartupState();
      window.mainAPI.settings.onSettingsGroupChange(group => (this.currentSettingsGroup = group));
    },
    async updateSettings(settings: DeepPartial<Settings>) {
      await window.mainAPI.settings.updateSettings(cloneDeep(settings));
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
      await this.updateSettings(this.defaultSettings!);
    },
    async updateStartupState(isEnabled: boolean) {
      await window.mainAPI.settings.updateStartupState(isEnabled);
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
      zoomIn: settings.renderer.hotkeys.zoomIn,
      zoomOut: settings.renderer.hotkeys.zoomOut,
      resetZoom: settings.renderer.hotkeys.resetZoom,
      toggleDefinition: settings.views.translation.renderer.toggleDefinitionHotkey,
      archiveResult: settings.views.translation.renderer.archiveResultHotkey,
      toggleTags: settings.views.translation.renderer.toggleTagsHotkey,
      addTag: settings.views.translation.renderer.addTagHotkey
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
      toggleSuspend: hotkeySettings.global.toggleSuspend
    },
    renderer: {
      hotkeys: {
        zoomIn: hotkeySettings.local.zoomIn,
        zoomOut: hotkeySettings.local.zoomOut,
        resetZoom: hotkeySettings.local.resetZoom
      }
    },
    views: {
      translation: {
        renderer: {
          toggleDefinitionHotkey: hotkeySettings.local.toggleDefinition,
          archiveResultHotkey: hotkeySettings.local.archiveResult,
          toggleTagsHotkey: hotkeySettings.local.toggleTags,
          addTagHotkey: hotkeySettings.local.addTag
        }
      }
    }
  };
}
