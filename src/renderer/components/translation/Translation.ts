import Vue from "vue";
import { Component } from "vue-property-decorator";
import { namespace } from "vuex-class";

import { TranslationResultViewSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";

import TranslationResult from "./translation-result/TranslationResult.vue";
import TranslationInput from "./translation-input/TranslationInput.vue";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { HistoryRecord } from "common/dto/history/HistoryRecord";

const ns = namespace("app/translation");

@Component({
    components: {
        TranslationResult,
        TranslationInput
    }
})
export default class Translation extends Vue {
    @ns.State public historyRecord!: HistoryRecord | null;
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
    @ns.Action public readonly setStarredStatus!: (request: { record: HistoryRecord; isStarred: boolean }) => void;

    constructor() {
        super();
        this.fetchData();
    }

    public get hasResult(): boolean {
        return this.historyRecord !== null;
    }
}