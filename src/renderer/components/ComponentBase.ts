import Vue from "vue";
import { IRendererMessageBus } from "common/messaging/IRendererMessageBus";
import { MessageBus } from "common/messaging/MessageBus";
import { ipcMain } from "electron";

export default class TranslationResult extends Vue {
    protected MessageBus: IRendererMessageBus;

    constructor() {
        super();
        this.MessageBus = new MessageBus();
    }
}