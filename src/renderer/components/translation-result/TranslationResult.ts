import { Component, Prop, Vue } from "vue-property-decorator";
import { ipcRenderer } from "electron"
import ComponentBase from "../ComponentBase";

@Component
export default class TranslationResult extends ComponentBase {

    text: string = "";

    constructor() {
        super();
        this.MessageBus.receiveTranslateResult(translateResult => this.updateTranslateResult(translateResult))
    }

    updateTranslateResult(text: string): void {
        this.text = text;
    }
}