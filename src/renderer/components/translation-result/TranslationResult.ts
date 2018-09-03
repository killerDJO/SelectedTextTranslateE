import Vue from "vue";
import { Component } from "vue-property-decorator";
import { namespace } from "vuex-class";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { TranslationResultViewSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";

import TranslationResultContent from "./content/TranslationResultContent.vue";
import TranslationResultHeader from "./header/TranslationResultHeader.vue";
import TranslationInput from "./translation-input/TranslationInput.vue";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";

const ns = namespace("app/translationResult");

@Component({
    components: {
        TranslationResultContent,
        TranslationResultHeader,
        TranslationInput
    }
})
export default class TranslationResult extends Vue {
    @ns.State public translateResult!: TranslateResult;
    @ns.State public translationResultViewSettings!: TranslationResultViewSettings;
    @ns.State public isInitialized!: boolean;
    @ns.State public isInProgress!: boolean;
    @ns.State public showInput!: boolean;
    @ns.State public defaultView!: TranslateResultViews;

    @ns.Action private readonly fetchData!: () => void;
    @ns.Action public readonly playText!: () => void;
    @ns.Action public readonly translateText!: (text: string) => void;
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