import { defineStore } from 'pinia';

import type { ApplicationInfo } from '@selected-text-translate/common';

interface AboutState {
  info: ApplicationInfo | null;
}

export const useAboutStore = defineStore('about', {
  state: () => {
    const state: AboutState = {
      info: null
    };
    return state;
  },
  actions: {
    async setup() {
      this.info = await window.mainAPI.about.getApplicationInfo();
    },
    async checkForUpdates() {
      await window.mainAPI.about.checkForUpdates();
    },
    async openHomePage() {
      await window.mainAPI.core.openUrl(this.info!.homepage);
    }
  }
});
