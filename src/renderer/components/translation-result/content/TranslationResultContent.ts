import { Component, Prop } from "vue-property-decorator";

import { ScoreSettings, ResultVisibilitySettings } from "common/dto/presentation-settings/PresentationSettings";
import { TranslateResultCategory, TranslateResultCategoryEntry } from "common/dto/translation/TranslateResult";

import { ComponentBase } from "components/ComponentBase";
import TranslationResultContentCategory from "components/translation-result/content/category/TranslationResultContentCategory.vue";

@Component({
    components: {
        TranslationResultContentCategory
    }
})
export default class TranslationResultContent extends ComponentBase {

    @Prop(Array)
    public categories!: ReadonlyArray<TranslateResultCategory>;

    @Prop(Object)
    public scoreSettings!: ScoreSettings;

    @Prop(Object)
    public resultVisibilitySettings!: ResultVisibilitySettings;
}