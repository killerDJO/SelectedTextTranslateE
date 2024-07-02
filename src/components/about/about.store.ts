import { defineStore } from 'pinia';

import { hostApi } from '~/host/host-api.service';

interface AboutState {
  version: string | null;
  isCheckInProgress: boolean;
  homepage: string;
}

export const useAboutStore = defineStore('about', {
  state: () => {
    const state: AboutState = {
      version: null,
      homepage: 'https://github.com/killerDJO/SelectedTextTranslateE',
      isCheckInProgress: false
    };
    return state;
  },
  actions: {
    async setup() {
      this.version = await hostApi.updater.getVersion();
    },
    async checkForUpdates() {
      try {
        this.isCheckInProgress = true;
        await hostApi.updater.checkForUpdates();
      } finally {
        this.isCheckInProgress = false;
      }
    },
    async openHomePage() {
      await hostApi.openUrl(this.homepage);
    }
  }
});
