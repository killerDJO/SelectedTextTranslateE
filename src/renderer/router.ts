import Router from "vue-router";

import { ViewNames } from "common/ViewNames";

import Translation from "./components/translation/Translation.vue";
import Settings from "./components/settings/Settings.vue";
import History from "./components/history/History.vue";

export const router = new Router({
    routes: [
        {
            path: `/${ViewNames.Translation}`,
            name: ViewNames.Translation,
            component: Translation
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
            redirect: `/${ViewNames.Translation}`
        }
    ]
});