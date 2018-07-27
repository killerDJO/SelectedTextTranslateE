import Vue from "vue";
import { Component } from "vue-property-decorator";
import { namespace } from "vuex-class";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { TranslationResultViewSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";

import TranslationResultContent from "./content/TranslationResultContent.vue";
import TranslationResultHeader from "./header/TranslationResultHeader.vue";

const ns = namespace("app/translationResult");

@Component({
    components: {
        TranslationResultContent,
        TranslationResultHeader
    }
})
export default class TranslationResult extends Vue {
    @ns.State public translateResult!: TranslateResult;
    @ns.State public translationResultViewSettings!: TranslationResultViewSettings;
    @ns.State public isInitialized!: boolean;

    @ns.Action private readonly fetchData!: () => void;
    @ns.Action public readonly playText!: () => void;
    @ns.Action public readonly translateSuggestion!: () => void;
    @ns.Action public readonly forceTranslation!: () => void;

    constructor() {
        super();
        this.fetchData();
    }

    public get hasResult(): boolean {
        return this.translateResult !== null;
    }
}