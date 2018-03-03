import { Component, Prop } from "vue-property-decorator";
import { ComponentBase } from "renderer/components/ComponentBase";
import { TranslateResultSentence } from "common/dto/translation/TranslateResultSentence";

@Component
export default class TranslationResultHeader extends ComponentBase {

    @Prop(Object)
    public sentence!: TranslateResultSentence;
}