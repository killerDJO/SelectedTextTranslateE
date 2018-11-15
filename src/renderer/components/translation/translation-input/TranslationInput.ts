import Vue from "vue";
import { Prop, Component, Watch } from "vue-property-decorator";

import { TranslationRequest } from "common/dto/translation/TranslationRequest";
import { PlayTextRequest } from "common/dto/translation/PlayTextRequest";
import { LanguageSettings } from "common/dto/settings/LanguageSettings";

@Component
export default class TranslationInput extends Vue {
    @Prop(Map) public languages!: Map<string, string>;
    @Prop(Object) public languageSettings!: LanguageSettings;

    public currentLanguageSettings!: LanguageSettings;
    public text: string = "";

    @Watch("languageSettings")
    public settingsChanged() {
        console.log(this.languageSettings);
    }

    public translate(): void {
        if (!!this.text) {
            const request: TranslationRequest = {
                text: this.text,
                isForcedTranslation: false,
                refreshCache: false
            };
            this.$emit("translate-text", request);
        }
    }

    public playText(): void {
        if (!!this.text) {
            const request: PlayTextRequest = {
                text: this.text,
                language: this.languageSettings.sourceLanguage
            };
            this.$emit("play-text", request);
        }
    }
}