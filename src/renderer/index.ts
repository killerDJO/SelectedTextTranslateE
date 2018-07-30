import { webFrame } from "electron";
import Vue from "vue";
import Vuex from "vuex";
import Router from "vue-router";
import { root, RootState } from "root.store";

import App from "components/app/App.vue";
import ValidatedField from "components/shared/validated-field/ValidatedField.vue";
import Slider from "components/shared/slider/Slider.vue";
import ConfirmModal from "components/shared/confirm-modal/ConfirmModal.vue";

import { router } from "router";
import { MessageBus } from "communication/MessageBus";
import { Messages } from "common/messaging/Messages";

import "filters";
import "directives";

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
        this.registerPlugins();
        this.registerSharedComponents();

        new Vue({
            store: new Vuex.Store<RootState>(root),
            components: { App },
            render(createElement) {
                return createElement("app");
            },
            router,
        }).$mount(".app");
    }

    private static registerSharedComponents(): void {
        Vue.component("validated-field", ValidatedField);
        Vue.component("slider", Slider);
        Vue.component("confirm-modal", ConfirmModal);
    }

    private static registerPlugins(): void {
        Vue.use(Router);
        Vue.use(Vuex);
    }

    private static setupErrorHandling(): void {
        const messageBus = new MessageBus();
        window.onerror = (message: string | Event, source: string | undefined, lineno: number | undefined, colno: number | undefined, error: Error | undefined) => {
            Bootstrapper.sendErrorMessage(messageBus, error || new Error(message.toString()));
        };

        Vue.config.errorHandler = (error: Error, vm: Vue, info: string) => {
            Bootstrapper.sendErrorMessage(messageBus, error);
            console.error(error);
        };
    }

    private static sendErrorMessage(messageBus: MessageBus, error: Error): void {
        messageBus.sendCommand<Error>(Messages.Common.RendererError, { message: error.message, stack: error.stack, name: error.name });
    }
}

Bootstrapper.bootstrap();