import { Component, Prop } from "vue-property-decorator";
import { ComponentBase } from "renderer/components/ComponentBase";
import { TranslateResultSentence } from "common/dto/translation/TranslateResultSentence";

@Component
export default class TranslationResultHeader extends ComponentBase {

    @Prop(Object)
    public sentence!: TranslateResultSentence;

    public playText(): void {
        this.$emit("play-text");
    }

    public get isInputCorrected(): boolean {
        if (this.sentence.origin === null) {
            return false;
        }

        return this.sentence.input.trim() !== this.sentence.origin.trim();
    }

    public get hasSuggestion(): boolean {
        return !this.isInputCorrected && !!this.sentence.suggestion;
    }

    public translateSuggestion(): void {
        this.$emit("translate-suggestion");
    }

    public forceTranslation(): void {
        this.$emit("force-translation");
    }
}