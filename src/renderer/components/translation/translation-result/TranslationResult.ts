import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";

import { TranslateResultRendererSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { TranslationRequest } from "common/dto/translation/TranslationRequest";

import TranslationResultContent from "components/translation/translation-result/content/TranslationResultContent.vue";
import TranslationResultHeader from "components/translation/translation-result/header/TranslationResultHeader.vue";

import { hotkeysRegistry } from "services/HotkeysRegistry";

@Component({
    components: {
        TranslationResultContent,
        TranslationResultHeader,
    }
})
export default class TranslationResult extends Vue {
    private static readonly TranslateResultHotkeysNamespace: string = "translate-result";

    @Prop(Object) public historyRecord!: HistoryRecord | null;
    @Prop(Map) public languages!: Map<string, string>;
    @Prop(Object) public translationResultViewSettings!: TranslateResultRendererSettings;
    @Prop(Boolean) public isInProgress!: boolean;
    @Prop(String) public defaultView!: TranslateResultViews;

    @Prop({
        type: Boolean,
        default: false
    })
    public isEmbedded!: boolean;

    @Prop(Boolean)
    public isOffline!: boolean;

    public showProgressIndicator: boolean = false;

    public playText(): void {
        this.$emit("play-text");
    }

    public translateText(text: string): void {
        if (this.historyRecord === null) {
            return;
        }

        const request: TranslationRequest = {
            text: text,
            isForcedTranslation: false,
            refreshCache: false,
            sourceLanguage: this.historyRecord.sourceLanguage,
            targetLanguage: this.historyRecord.targetLanguage
        };
        this.$emit("translate-text", request);
    }

    public translateSuggestion(): void {
        this.$emit("translate-suggestion");
    }

    public forceTranslation(): void {
        this.$emit("force-translation");
    }

    public refreshTranslation(): void {
        this.$emit("refresh-translation");
    }

    public changeLanguage(): void {
        this.$emit("change-language");
    }

    public search(): void {
        this.$emit("search");
    }

    public setStarredStatus(isStarred: boolean): void {
        this.$emit("set-starred-status", { record: this.historyRecord, isStarred });
    }

    public archive(): void {
        this.$emit("archive", this.historyRecord);
    }

    public updateTags(tags: ReadonlyArray<string>): void {
        this.$emit("update-tags", { record: this.historyRecord, tags });
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

    @Watch("translationResultViewSettings", { deep: true, immediate: true })
    public watchTranslationResultViewSettings() {
        hotkeysRegistry.unregisterHotkeys(TranslationResult.TranslateResultHotkeysNamespace);

        hotkeysRegistry.registerHotkeys(TranslationResult.TranslateResultHotkeysNamespace, this.translationResultViewSettings.archiveResultHotkey, () => this.archive());
    }

    private get hasTranslateResult(): boolean {
        return !!this.historyRecord;
    }
}