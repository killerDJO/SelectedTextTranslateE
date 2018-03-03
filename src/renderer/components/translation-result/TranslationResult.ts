import { Component } from "vue-property-decorator";
import { ipcRenderer } from "electron";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { Messages } from "common/messaging/Messages";
import { ComponentBase } from "renderer/components/ComponentBase";
import TranslationResultContent from "./content/TranslationResultContent.vue";
import TranslationResultHeader from "./header/TranslationResultHeader.vue";

@Component({
    components: {
        TranslationResultContent,
        TranslationResultHeader
    }
})
export default class TranslationResult extends ComponentBase {

    private readonly categoryToExpansionStateMap: { [key: number]: boolean } = {};
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