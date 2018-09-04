import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { TranslationResultViewSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";

import TranslationResultContent from "./content/TranslationResultContent.vue";
import TranslationResultHeader from "./header/TranslationResultHeader.vue";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";

@Component({
    components: {
        TranslationResultContent,
        TranslationResultHeader,
    }
})
export default class TranslationResult extends Vue {
    @Prop(Object) public translateResult!: TranslateResult;
    @Prop(Object) public translationResultViewSettings!: TranslationResultViewSettings;
    @Prop(Boolean) public isInProgress!: boolean;
    @Prop(String) public defaultView!: TranslateResultViews;

    @Prop({
        type: Boolean,
        default: false
    })
    public isEmbedded!: boolean;

    public showProgressIndicator: boolean = false;

    public playText(): void {
        this.$emit("play-text");
    }

    public translateText(text: string): void {
        this.$emit("translate-text", text);
    }

    public translateSuggestion(): void {
        this.$emit("translate-suggestion");
    }

    public forceTranslation(): void {
        this.$emit("force-translation");
    }

    @Watch("isInProgress", { immediate: true })
    public progressStatusChanged(): void {

        if (this.isInProgress && this.hasTranslateResult) {
            setTimeout(
                () => {
                    if (this.isInProgress) {
                        this.showProgressIndicator = true;
                    }
                },
                this.translationResultViewSettings.showLoaderDelay);
        } else if (this.isInProgress && !this.hasTranslateResult) {
            this.showProgressIndicator = true;
        } else {
            this.showProgressIndicator = false;
        }
    }

    private get hasTranslateResult(): boolean {
        return !!this.translateResult;
    }
}