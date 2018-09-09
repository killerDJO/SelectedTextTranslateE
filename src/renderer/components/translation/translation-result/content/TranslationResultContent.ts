import { Component, Prop, Watch } from "vue-property-decorator";
import Vue from "vue";

import { TranslationViewRendererSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";

import TranslationResultContentCategory from "components/translation/translation-result/content/category/TranslationResultContentCategory.vue";
import TranslationResultDefinitionCategory from "components/translation/translation-result/content/definitions/TranslationResultDefinitionCategory.vue";
import TranslationResultStatistic from "components/translation/translation-result/content/statistic/TranslationResultStatistic.vue";
import { HistoryRecord } from "common/dto/history/HistoryRecord";

@Component({
    components: {
        TranslationResultContentCategory,
        TranslationResultDefinitionCategory,
        TranslationResultStatistic
    }
})
export default class TranslationResultContent extends Vue {

    @Prop(Object)
    public historyRecord!: HistoryRecord;

    @Prop(Object)
    public translationResultViewSettings!: TranslationViewRendererSettings;

    @Prop(String)
    public defaultView!: TranslateResultViews;

    @Prop(Map)
    public languages!: Map<string, string>;

    @Prop(Boolean)
    public isEmbedded!: boolean;

    @Prop(Boolean)
    public isOffline!: boolean;

    public TranslateResultViews: typeof TranslateResultViews = TranslateResultViews;

    public currentView: TranslateResultViews = TranslateResultViews.Translation;

    public get hasCategories(): boolean {
        return !!this.historyRecord.translateResult.categories.length;
    }

    public get hasDefinitions(): boolean {
        return !!this.historyRecord.translateResult.definitions.length;
    }

    public get hasLanguageSuggestion(): boolean {
        return !!this.languageSuggestion && this.languageSuggestion !== this.historyRecord.sourceLanguage;
    }

    public get languageSuggestion(): string | null {
        return this.historyRecord.translateResult.sentence.languageSuggestion;
    }

    public mounted() {
        this.initializeCurrentView();
    }

    @Watch("defaultView")
    @Watch("historyRecord", { deep: true })
    public initializeCurrentView() {
        if (!this.hasCategories && this.hasDefinitions && this.defaultView === TranslateResultViews.Translation) {
            this.currentView = TranslateResultViews.Definition;
        } else if (!this.hasDefinitions && this.defaultView === TranslateResultViews.Definition) {
            this.currentView = TranslateResultViews.Translation;
        } else {
            this.currentView = this.defaultView;
        }
    }

    public translate(text: string): void {
        this.$emit("translate", text);
    }

    public changeLanguage(): void {
        this.$emit("change-language");
    }

    public refreshTranslation(): void {
        this.$emit("refresh-translation");
    }

    public search(): void {
        this.$emit("search");
    }
}