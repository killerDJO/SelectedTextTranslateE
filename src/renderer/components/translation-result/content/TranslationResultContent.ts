import { Component, Prop } from "vue-property-decorator";
import Vue from "vue";

import { PresentationSettings } from "common/dto/settings/presentation-settings/PresentationSettings";
import { TranslateResultCategory, TranslateResultCategoryEntry } from "common/dto/translation/TranslateResult";

import TranslationResultContentCategory from "components/translation-result/content/category/TranslationResultContentCategory.vue";

@Component({
    components: {
        TranslationResultContentCategory
    }
})
export default class TranslationResultContent extends Vue {

    @Prop(Array)
    public categories!: ReadonlyArray<TranslateResultCategory>;

    @Prop(Object)
    public presentationSettings!: PresentationSettings;
}