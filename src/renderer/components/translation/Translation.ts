import Vue from "vue";
import { Component } from "vue-property-decorator";
import { namespace } from "vuex-class";

import { TranslationViewRendererSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";

import TranslationResult from "./translation-result/TranslationResult.vue";
import TranslationInput from "./translation-input/TranslationInput.vue";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { TranslationRequest } from "common/dto/translation/TranslationRequest";

const ns = namespace("app/translation");

@Component({
    components: {
        TranslationResult,
        TranslationInput
    }
})
export default class Translation extends Vue {
    @ns.State public translationHistoryRecord!: HistoryRecord | null;
    @ns.State public translationResultViewSettings!: TranslationViewRendererSettings | null;
    @ns.State public isTranslationInProgress!: boolean;
    @ns.State public languages!: Map<string, string>;
    @ns.State public showInput!: boolean;
    @ns.State public defaultTranslateResultView!: TranslateResultViews;

    @ns.Action private readonly setup!: () => void;
    @ns.Action public readonly playText!: () => void;
    @ns.Action public readonly translateText!: (request: TranslationRequest) => void;
    @ns.Action public readonly translateSuggestion!: () => void;
    @ns.Action public readonly forceTranslation!: () => void;
    @ns.Action public readonly refreshTranslation!: () => void;
    @ns.Action public readonly changeLanguage!: () => void;
    @ns.Action public readonly setStarredStatus!: (request: { record: HistoryRecord; isStarred: boolean }) => void;

    constructor() {
        super();
        this.setup();
    }

    public get hasResult(): boolean {
        return this.translationHistoryRecord !== null;
    }

    public get isInitialized(): boolean {
        return this.translationResultViewSettings !== null;
    }
}