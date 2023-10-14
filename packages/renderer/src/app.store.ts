import { defineStore } from 'pinia';

import type { Settings, DeepPartial } from '@selected-text-translate/common';

interface AppState {
  accentColor?: string;
  scaleFactor: number;
  isFrameless: boolean;
  _settings?: Settings;
}

export const useAppStore = defineStore('app', {
  state: () => {
    const state: AppState = {
      accentColor: undefined,
      scaleFactor: 1,
      isFrameless: false,
      _settings: undefined
    };
    return state;
  },
  getters: {
    hasSettings: state => !!state._settings,
    settings: state => {
      if (!state._settings) {
        throw new Error("Settings aren't available");
      }

      return state._settings;
    }
  },
  actions: {
    async setup(): Promise<void> {
      this.accentColor = await window.mainAPI.settings.getAccentColor();
      this.scaleFactor = await window.mainAPI.zoom.getScaleFactor();
      this.isFrameless = await window.mainAPI.settings.getFramelessStatus();
      this._settings = await window.mainAPI.settings.getSettings();
      window.mainAPI.settings.onAccentColorChange(accentColor => (this.accentColor = accentColor));
      window.mainAPI.zoom.onScaleFactorChange(scaleFactor => (this.scaleFactor = scaleFactor));
      window.mainAPI.settings.onSettingsChange(settings => (this._settings = settings));
    },
    zoomIn(): void {
      window.mainAPI.zoom.zoomIn();
    },
    zoomOut(): void {
      window.mainAPI.zoom.zoomOut();
    },
    resetZoom(): void {
      window.mainAPI.zoom.resetZoom();
    },
    openDevTools(): void {
      window.mainAPI.core.openDevTools();
    },
    async updateSettings(settings: DeepPartial<Settings>): Promise<void> {
      await window.mainAPI.settings.updateSettings(settings);
    }
  }
});
