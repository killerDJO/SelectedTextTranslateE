import { webFrame } from "electron";
import Vue from "vue";
import Vuex from "vuex";
import { root, RootState } from "store";

import Router from "vue-router";
import App from "./components/app/App.vue";
import { router } from "./router";

class Bootstrapper {

    public static bootstrap(): void {
        Bootstrapper.preventNativeZoom();
        Bootstrapper.bootstrapVue();
    }

    private static preventNativeZoom(): void {
        webFrame.setZoomFactor(1);
        webFrame.setVisualZoomLevelLimits(1, 1);
        webFrame.setLayoutZoomLevelLimits(0, 0);
    }

    private static bootstrapVue(): void {
        Vue.use(Vuex);
        const store = new Vuex.Store<RootState>(root);
        new Vue({
            store,
            components: { App },
            render(createElement) {
                return createElement("app");
            },
            router,
        }).$mount(".app");
    }
}

Bootstrapper.bootstrap();