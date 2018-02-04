import Vue from "vue";
import Router from "vue-router";
import App from "./app.vue";
import { router } from "./router";

new Vue({
    components: { App },
    render(createElement) {
        return createElement("app");
    },
    router
}).$mount("body");

import { ipcRenderer } from "electron"
ipcRenderer.on("translate-result", (sender: Electron.EventEmitter, translateResult: string) => {
    console.log("result: " + translateResult);
})