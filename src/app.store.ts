import { defineStore } from 'pinia';

import type { PartialSettings, Settings } from '~/host/models/settings.model';
import { hostApi } from '~/host/host-api.service';

import { ViewNames } from './host/models/views.model';

interface AppState {
  accentColor?: string;
  _settings?: Settings;
}

export const useAppStore = defineStore('app', {
  state: () => {
    const state: AppState = {
      accentColor: undefined,
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
    },
    scaleFactor: state => {
      if (!state._settings) {
        return 1;
      }
      const viewName = hostApi.view.getViewName();
      if (viewName !== ViewNames.Translation && state._settings.scaling.scaleTranslationViewOnly) {
        return 1;
      }

      return state._settings.scaling.scaleFactor;
    },
    isFrameless: () => {
      return hostApi.view.getViewName() === ViewNames.Translation;
    }
  },
  actions: {
    async setup(): Promise<void> {
      this.accentColor = await hostApi.view.getAccentColor();
      await hostApi.view.onAccentColorChange(accentColor => (this.accentColor = accentColor));

      this._settings = await hostApi.settings.getSettings();
      await hostApi.settings.onSettingsChange(settings => (this._settings = settings));
    },
    zoomIn(): void {
      const scalingSettings = this.settings.scaling;
      const newScaleFactor = scalingSettings.scaleFactor + scalingSettings.scalingStep;
      if (newScaleFactor > scalingSettings.maxScaling) {
        return;
      }

      this.changeScale(newScaleFactor);
    },
    zoomOut(): void {
      const scalingSettings = this.settings.scaling;
      const newScaleFactor = scalingSettings.scaleFactor - scalingSettings.scalingStep;
      if (newScaleFactor < scalingSettings.minScaling) {
        return;
      }

      this.changeScale(newScaleFactor);
    },
    resetZoom(): void {
      this.changeScale(1);
    },
    async updateSettings(settings: PartialSettings): Promise<void> {
      await hostApi.settings.updateSettings(settings);
    },
    async changeScale(scaleFactor: number): Promise<void> {
      await hostApi.settings.updateSettings({ scaling: { scaleFactor } });
    }
  }
});
