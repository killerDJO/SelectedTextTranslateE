import { Component, Prop } from "vue-property-decorator";
import { ComponentBase } from "renderer/components/ComponentBase";
import { TranslateResultCategory, TranslateResultCategoryEntry } from "common/dto/translation/TranslateResult";

@Component
export default class TranslationResultContent extends ComponentBase {

    @Prop({ type: Array })
    public categories!: ReadonlyArray<TranslateResultCategory>;

    public getScoreClass(entry: TranslateResultCategoryEntry): string {
        if (entry.score >= 0.05) {
            return "high";
        }
        if (entry.score >= 0.0025) {
            return "medium";
        }
        return "low";
    }
}