import Vue from "vue";
import { ipcMain } from "electron";
import { MessageBus } from "renderer/framework/MessageBus";

export default class TranslationResult extends Vue {
    protected messageBus: MessageBus;

    constructor() {
        super();
        this.messageBus = new MessageBus();
    }
}