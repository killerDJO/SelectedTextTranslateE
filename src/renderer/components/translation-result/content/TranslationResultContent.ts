import { Component, Prop, Watch } from "vue-property-decorator";
import Vue from "vue";

import { TranslationResultViewSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";
import { TranslateResultCategory } from "common/dto/translation/TranslateResult";

import TranslationResultContentCategory from "components/translation-result/content/category/TranslationResultContentCategory.vue";
import TranslationResultDefinitionCategory from "components/translation-result/content/definitions/TranslationResultDefinitionCategory.vue";
import { TranslateResultDefinitionCategory } from "common/dto/translation/TranslateResultDefinitionCategory";

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
    public translationResultViewSettings!: TranslationResultViewSettings;

    public showDefinitions: boolean = false;

    public get hasCategories(): boolean {
        return !!this.categories.length;
    }

    public get hasDefinitions(): boolean {
        return !!this.definitions.length;
    }

    @Watch("hasDefinitions")
    @Watch("hasCategories")
    public checkInitialView(): void {
        if (!this.hasCategories && this.hasDefinitions) {
            this.showDefinitions = true;
        }
    }
}