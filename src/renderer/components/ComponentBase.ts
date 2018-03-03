import Vue from "vue";
import { ipcMain } from "electron";
import { MessageBus } from "renderer/framework/MessageBus";

export class ComponentBase extends Vue {
    protected messageBus: MessageBus;

    constructor() {
        super();
        this.messageBus = new MessageBus();
    }
}