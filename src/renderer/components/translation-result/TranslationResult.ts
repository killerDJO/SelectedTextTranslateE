import { Component } from "vue-property-decorator";
import { ipcRenderer } from "electron";

import ComponentBase from "../ComponentBase";
import { TranslateResult } from "common/dto/translation/TranslateResult";
import { Messages } from "common/messaging/Messages";

@Component
export default class TranslationResult extends ComponentBase {

    public translateResult: TranslateResult | null = null;

    constructor() {
        super();
        this.messageBus.getValue<TranslateResult | null>(Messages.TranslateResult).subscribe(this.updateTranslateResult);
    }

    public get hasResult(): boolean {
        return this.translateResult !== null;
    }

    private updateTranslateResult(translateResult: TranslateResult | null): void {
        this.translateResult = translateResult;
    }
}