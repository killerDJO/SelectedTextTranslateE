import Router from "vue-router";

import { ViewNames } from "common/ViewNames";

import TranslationResult from "./components/translation-result/TranslationResult.vue";
import Settings from "./components/settings/Settings.vue";
import History from "./components/history/History.vue";

export const router = new Router({
    routes: [
        {
            path: `/${ViewNames.TranslationResult}`,
            name: ViewNames.TranslationResult,
            component: TranslationResult
        },
        {
            path: `/${ViewNames.Settings}`,
            name: "settings",
            component: Settings
        },
        {
            path: `/${ViewNames.History}`,
            name: "history",
            component: History
        },
        {
            path: "*",
            redirect: `/${ViewNames.TranslationResult}`
        }
    ]
});