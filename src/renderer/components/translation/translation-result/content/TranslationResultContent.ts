import { Component, Prop, Watch } from "vue-property-decorator";
import Vue from "vue";

import { TranslateResultRendererSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { HistoryRecord } from "common/dto/history/HistoryRecord";

import TranslationResultContentCategory from "components/translation/translation-result/content/category/TranslationResultContentCategory.vue";
import TranslationResultDefinitionCategory from "components/translation/translation-result/content/definitions/TranslationResultDefinitionCategory.vue";
import TranslationResultStatistic from "components/translation/translation-result/content/statistic/TranslationResultStatistic.vue";
import TagsEditor from "components/history/tags-editor/TagsEditor.vue";

import { hotkeysRegistry } from "services/HotkeysRegistry";

@Component({
    components: {
        TranslationResultContentCategory,
        TranslationResultDefinitionCategory,
        TranslationResultStatistic,
        TagsEditor
    }
})
export default class TranslationResultContent extends Vue {
    private static readonly TranslateResultHotkeysNamespace: string = "translate-result";

    @Prop(Object)
    public historyRecord!: HistoryRecord;

    @Prop(Object)
    public translationResultViewSettings!: TranslateResultRendererSettings;

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
    public showTags: boolean = false;

    public get hasCategories(): boolean {
        return !!this.historyRecord.translateResult.categories.length;
    }

    public get hasDefinitions(): boolean {
        return !!this.historyRecord.translateResult.definitions.length || !!this.similarWords.length;
    }

    public get similarWords(): ReadonlyArray<string> {
        return (this.historyRecord.translateResult.sentence.similarWords || []);
    }

    public get hasLanguageSuggestion(): boolean {
        return !!this.languageSuggestion && this.languageSuggestion !== this.historyRecord.sourceLanguage;
    }

    public get languageSuggestion(): string | null {
        return this.historyRecord.translateResult.sentence.languageSuggestion;
    }

    public get toggleTagsButtonText(): string {
        if (this.showTags) {
            return "Hide Tags";
        }

        const tagsNumber = (this.historyRecord.tags || []).length;
        if (tagsNumber === 0) {
            return "No Tags";
        }

        return `${tagsNumber} Tag${tagsNumber > 1 ? "s" : ""}`;
    }

    public mounted() {
        this.initializeCurrentView();
    }

    @Watch("defaultView")
    public initializeCurrentView() {
        if (!this.hasCategories && this.hasDefinitions && this.defaultView === TranslateResultViews.Translation) {
            this.currentView = TranslateResultViews.Definition;
        } else if (!this.hasDefinitions && this.defaultView === TranslateResultViews.Definition) {
            this.currentView = TranslateResultViews.Translation;
        } else {
            this.currentView = this.defaultView;
        }
    }

    @Watch("historyRecord", { deep: true })
    public watchHistoryRecord(oldValue: HistoryRecord, newValue: HistoryRecord) {
        if (oldValue.id !== newValue.id) {
            this.initializeCurrentView();
        }
    }

    @Watch("translationResultViewSettings", { deep: true, immediate: true })
    public watchTranslationResultViewSettings() {
        hotkeysRegistry.unregisterHotkeys(TranslationResultContent.TranslateResultHotkeysNamespace);

        hotkeysRegistry.registerHotkeys(
            TranslationResultContent.TranslateResultHotkeysNamespace, this.translationResultViewSettings.toggleDefinitionHotkey, () => {
                if (this.currentView === TranslateResultViews.Definition && this.hasCategories) {
                    this.currentView = TranslateResultViews.Translation;
                } else if (this.hasDefinitions) {
                    this.currentView = TranslateResultViews.Definition;
                }
            });
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

    public updateTags(tags: ReadonlyArray<string>): void {
        this.$emit("update-tags", tags);
    }
}