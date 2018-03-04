import { Component, Prop } from "vue-property-decorator";

import { ScoreSettings } from "common/dto/presentation-settings/ScoreSettings";
import { ResultVisibilitySettings } from "common/dto/presentation-settings/ResultVisibilitySettings";
import { TranslateResultCategory, TranslateResultCategoryEntry } from "common/dto/translation/TranslateResult";

import { ComponentBase } from "renderer/components/ComponentBase";
import TranslationResultContentCategory from "renderer/components/translation-result/content/category/TranslationResultContentCategory.vue";

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