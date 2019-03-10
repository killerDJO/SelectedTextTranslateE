import { webFrame, ipcRenderer } from "electron";
import Vue from "vue";
import Vuex from "vuex";
import Router from "vue-router";
import * as Paginate from "vuejs-paginate";

import { Messages } from "common/messaging/Messages";

import { MessageBus } from "common/renderer/MessageBus";

import { root, RootState } from "root.store";
import { router } from "router";
import "filters";
import "directives";

import App from "components/app/App.vue";
import ValidatedField from "components/shared/validated-field/ValidatedField.vue";
import Slider from "components/shared/slider/Slider.vue";
import Modal from "components/shared/modal/Modal.vue";
import ConfirmModal from "components/shared/confirm-modal/ConfirmModal.vue";
import Checkbox from "components/shared/checkbox/Checkbox.vue";
import IconButton from "components/shared/icon-button/IconButton.vue";
import LinkButton from "components/shared/link-button/LinkButton.vue";
import AppButton from "components/shared/app-button/AppButton.vue";
import ToggleButton from "components/shared/toggle-button/ToggleButton.vue";
import DropListButton from "components/shared/drop-list-button/DropListButton.vue";
import Password from "components/shared/password/Password.vue";
import Typeahead from "components/shared/typeahead/Typeahead.vue";
import Datepicker from "components/shared/datepicker/Datepicker.vue";
import LanguageSelector from "components/shared/language-selector/LanguageSelector.vue";
import DataTable from "components/shared/data-table/DataTable.vue";

class Bootstrapper {

    public static bootstrap(): void {
        Bootstrapper.setupErrorHandling();
        Bootstrapper.preventNativeZoom();
        ipcRenderer.setMaxListeners(Infinity);
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
        Vue.component("modal", Modal);
        Vue.component("confirm-modal", ConfirmModal);
        Vue.component("paginate", Paginate);
        Vue.component("checkbox", Checkbox);
        Vue.component("icon-button", IconButton);
        Vue.component("link-button", LinkButton);
        Vue.component("app-button", AppButton);
        Vue.component("toggle-button", ToggleButton);
        Vue.component("drop-list-button", DropListButton);
        Vue.component("password", Password);
        Vue.component("typeahead", Typeahead);
        Vue.component("language-selector", LanguageSelector);
        Vue.component("datepicker", Datepicker);
        Vue.component("data-table", DataTable);
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