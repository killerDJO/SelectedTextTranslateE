import { defineStore } from 'pinia';

import { useAppStore } from '~/app.store';
import { DeepPartial, Settings } from '~/host/models/settings.model';
import { hostApi } from '~/host/host-api.service';

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
    defaultHotkeySettings: state => {
      if (!state.defaultSettings) {
        throw new Error("Settings aren't initialized");
      }
      return state.defaultSettings.hotkeys;
    }
  },
  actions: {
    async setup() {
      this.defaultSettings = await hostApi.settings.getDefaultSettings();
      this.isStartupEnabled = await hostApi.startup.getStartupState();
    },
    async updateSettings(settings: DeepPartial<Settings>) {
      await hostApi.settings.updateSettings(settings);
    },
    async pauseHotkeys() {
      await hostApi.globalHotkeys.pauseHotkeys();
    },
    async enableHotkeys() {
      await hostApi.globalHotkeys.resumeHotkeys();
    },
    async openSettingsFile() {
      await hostApi.settings.openSettingsFile();
    },
    async resetSettings() {
      await hostApi.settings.resetSettingsToDefault();
    },
    async updateStartupState(isEnabled: boolean) {
      await hostApi.startup.updateStartupState(isEnabled);
    }
  }
});
