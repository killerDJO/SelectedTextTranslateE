import Vue from "vue";
import Router from "vue-router";

import TranslationResult from "./components/translation-result/TranslationResult.vue";
import Settings from "./components/settings/Settings.vue";

Vue.use(Router);

export const router = new Router({
    routes: [
        {
            path: "/",
            name: "translation-result",
            component: TranslationResult
        },
        {
            path: "/settings",
            name: "settings",
            component: Settings
        },
        {
            path: "*",
            redirect: "/"
        }
    ]
});