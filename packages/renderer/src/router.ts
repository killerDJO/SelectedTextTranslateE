import { createRouter, createWebHashHistory } from 'vue-router';

import { ViewNames } from '@selected-text-translate/common';

import TranslationView from './components/translation/translation-view.vue';
import HistoryView from './components/history/history-view.vue';
import SettingsView from './components/settings/settings-view.vue';
import AboutView from './components/about/about-view.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: `/${ViewNames.Translation}`,
      name: ViewNames.Translation,
      component: TranslationView
    },
    {
      path: `/${ViewNames.Settings}`,
      name: 'settings',
      component: SettingsView
    },
    {
      path: `/${ViewNames.History}`,
      name: 'history',
      component: HistoryView
    },
    {
      path: `/${ViewNames.About}`,
      name: 'about',
      component: AboutView
    }
  ]
});

export default router;
