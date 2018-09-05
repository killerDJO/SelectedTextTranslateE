import { Component, Prop, Watch } from "vue-property-decorator";
import Vue from "vue";

import { TranslationViewRendererSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";
import { TranslateResultCategory, TranslateResultDefinitionCategory } from "common/dto/translation/TranslateResult";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";

import TranslationResultContentCategory from "components/translation/translation-result/content/category/TranslationResultContentCategory.vue";
import TranslationResultDefinitionCategory from "components/translation/translation-result/content/definitions/TranslationResultDefinitionCategory.vue";

@Component({
    components: {
        TranslationResultContentCategory,
        TranslationResultDefinitionCategory
    }
})
export default class TranslationResultContent extends Vue {

    @Prop(Array)
    public categories!: ReadonlyArray<TranslateResultCategory>;

    @Prop(Array)
    public definitions!: ReadonlyArray<TranslateResultDefinitionCategory>;

    @Prop(Object)
    public translationResultViewSettings!: TranslationViewRendererSettings;

    @Prop(String)
    public defaultView!: TranslateResultViews;

    @Prop(Boolean)
    public isEmbedded!: boolean;

    public TranslateResultViews: typeof TranslateResultViews = TranslateResultViews;

    public currentView: TranslateResultViews = TranslateResultViews.Translation;

    public get hasCategories(): boolean {
        return !!this.categories.length;
    }

    public get hasDefinitions(): boolean {
        return !!this.definitions.length;
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
}