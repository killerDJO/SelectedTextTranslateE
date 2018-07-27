import { Component, Prop } from "vue-property-decorator";
import Vue from "vue";

import { TranslationResultViewSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";
import { TranslateResultCategory } from "common/dto/translation/TranslateResult";

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
    public translationResultViewSettings!: TranslationResultViewSettings;
}