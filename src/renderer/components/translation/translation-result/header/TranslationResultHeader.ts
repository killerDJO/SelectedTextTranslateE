import Vue from "vue";

import { Component, Prop } from "vue-property-decorator";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { TranslateResultSentence } from "common/dto/translation/TranslateResult";

@Component
export default class TranslationResultHeader extends Vue {

    @Prop(Object)
    public historyRecord!: HistoryRecord;

    @Prop(Boolean)
    public isEmbedded!: boolean;

    public playText(): void {
        this.$emit("play-text");
    }

    public get sentence(): TranslateResultSentence {
        return this.historyRecord.translateResult.sentence;
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

    public setStarredStatus(isStarred: boolean): void {
        this.$emit("set-starred-status", isStarred);
    }

    public translateText(text: string): void {
        if (text !== this.sentence.origin && !!text) {
            this.$emit("translate-text", text);
        }
    }
}