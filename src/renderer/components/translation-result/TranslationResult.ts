import { Component } from "vue-property-decorator";
import { ipcRenderer } from "electron";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { Messages } from "common/messaging/Messages";
import { ScoreSettings } from "common/dto/presentation-settings/ScoreSettings";
import { ResultVisibilitySettings } from "common/dto/presentation-settings/ResultVisibilitySettings";

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

    public translateResult: TranslateResult | null = null;
    public scoreSettings!: ScoreSettings;
    public resultVisibilitySettings!: ResultVisibilitySettings;

    constructor() {
        super();
        this.messageBus.getValue<TranslateResult | null>(Messages.TranslateResult).subscribe(this.updateTranslateResult);
        this.messageBus.getValue<ScoreSettings>(Messages.ScoreSettings).subscribe(this.updateScoreSettings);
        this.messageBus.getValue<ResultVisibilitySettings>(Messages.ResultVisibilitySettings).subscribe(this.updateVisibilitySettings);
    }

    public get hasResult(): boolean {
        return this.translateResult !== null;
    }

    public playText(): void {
        if (this.translateResult === null) {
            return;
        }

        this.messageBus.sendCommand(Messages.PlayTextCommand, this.translateResult.sentence.input);
    }

    public translateSuggestion(): void {
        if (this.translateResult === null) {
            return;
        }

        this.messageBus.sendCommand(Messages.TranslateCommand, this.translateResult.sentence.suggestion);
    }

    public forceTranslation(): void {
        if (this.translateResult === null) {
            return;
        }

        this.messageBus.sendCommand(Messages.ForceTranslateCommand, this.translateResult.sentence.input);
    }

    private updateTranslateResult(translateResult: TranslateResult | null): void {
        this.translateResult = translateResult;
    }

    private updateScoreSettings(scoreSettings: ScoreSettings): void {
        this.scoreSettings = scoreSettings;
    }

    private updateVisibilitySettings(resultVisibilitySettings: ResultVisibilitySettings): void {
        this.resultVisibilitySettings = resultVisibilitySettings;
    }
}