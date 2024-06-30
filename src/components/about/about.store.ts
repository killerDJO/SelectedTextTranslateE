import { defineStore } from 'pinia';

import { hostApi } from '~/host/host-api.service';

interface AboutState {
  version: string | null;
  homepage: string;
}

export const useAboutStore = defineStore('about', {
  state: () => {
    const state: AboutState = {
      version: null,
      homepage: 'https://github.com/killerDJO/SelectedTextTranslateE'
    };
    return state;
  },
  actions: {
    async setup() {
      this.version = await hostApi.getVersion();
    },
    async checkForUpdates() {
      await hostApi.checkForUpdates();
    },
    async openHomePage() {
      await hostApi.openUrl(this.homepage);
    }
  }
});
