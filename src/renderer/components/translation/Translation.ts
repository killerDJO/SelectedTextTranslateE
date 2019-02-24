import Vue from "vue";
import { Component } from "vue-property-decorator";
import { namespace } from "vuex-class";

import { TranslateResultRendererSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { TranslationRequest } from "common/dto/translation/TranslationRequest";
import { LanguageSettings } from "common/dto/settings/LanguageSettings";
import { PlayTextRequest } from "common/dto/translation/PlayTextRequest";
import { TranslationKey } from "common/dto/translation/TranslationKey";

import TranslationResult from "components/translation/translation-result/TranslationResult.vue";
import TranslationInput from "components/translation/translation-input/TranslationInput.vue";

const ns = namespace("app/translation");

@Component({
    components: {
        TranslationResult,
        TranslationInput
    }
})
export default class Translation extends Vue {
    @ns.State public translationHistoryRecord!: HistoryRecord | null;
    @ns.State public translationResultViewSettings!: TranslateResultRendererSettings | null;
    @ns.State public isTranslationInProgress!: boolean;
    @ns.State public languages!: Map<string, string>;
    @ns.State public languageSettings!: LanguageSettings;
    @ns.State public showInput!: boolean;
    @ns.State public defaultTranslateResultView!: TranslateResultViews;
    @ns.State public isOffline!: boolean;
    @ns.State public isVisible!: boolean;

    @ns.Action private readonly setup!: () => void;
    @ns.Action public readonly playText!: () => void;
    @ns.Action public readonly playTextFromRequest!: (request: PlayTextRequest) => void;
    @ns.Action public readonly translateText!: (request: TranslationRequest) => void;
    @ns.Action public readonly translateSuggestion!: () => void;
    @ns.Action public readonly forceTranslation!: () => void;
    @ns.Action public readonly refreshTranslation!: () => void;
    @ns.Action public readonly changeLanguage!: () => void;
    @ns.Action public readonly search!: () => void;
    @ns.Action public readonly setStarredStatus!: (request: { record: TranslationKey; isStarred: boolean }) => void;
    @ns.Action public readonly archive!: (record: TranslationKey) => void;
    @ns.Action public readonly updateTags!: (request: { record: TranslationKey; tags: ReadonlyArray<string> }) => void;

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