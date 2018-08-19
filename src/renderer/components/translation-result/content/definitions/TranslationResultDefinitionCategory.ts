import { Component, Prop } from "vue-property-decorator";
import Vue from "vue";

import { TranslateResultDefinitionCategory } from "common/dto/translation/TranslateResultDefinitionCategory";

@Component
export default class TranslateResultDefinitionContentCategory extends Vue {

    @Prop(Object)
    public definitionCategory!: TranslateResultDefinitionCategory;
}