import { webFrame } from "electron";
import Vue from "vue";
import Vuex from "vuex";
import { root, RootState } from "store";

import Router from "vue-router";
import App from "./components/app/App.vue";
import { router } from "./router";
import { MessageBus } from "framework/MessageBus";
import { Messages } from "common/messaging/Messages";

class Bootstrapper {

    public static bootstrap(): void {
        Bootstrapper.setupErrorHandling();
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

    private static setupErrorHandling(): void {
        const messageBus = new MessageBus();
        window.onerror = (message: string | Event, source: string | undefined, lineno: number | undefined, colno: number | undefined, error: Error | undefined) => {
            Bootstrapper.sendErrorMessage(messageBus, error || new Error(message.toString()));
        };

        Vue.config.errorHandler = (error: Error, vm: Vue, info: string) => {
            Bootstrapper.sendErrorMessage(messageBus, error);
        };
    }

    private static sendErrorMessage(messageBus: MessageBus, error: Error): void {
        messageBus.sendCommand<Error>(Messages.RendererError, { message: error.message, stack: error.stack, name: error.name });
    }
}

Bootstrapper.bootstrap();