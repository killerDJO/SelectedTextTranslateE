import Vue from "vue";
import { Prop, Component, Watch } from "vue-property-decorator";

import { TranslationRequest } from "common/dto/translation/TranslationRequest";
import { PlayTextRequest } from "common/dto/translation/PlayTextRequest";
import { LanguageSettings } from "common/dto/settings/LanguageSettings";
import { Language } from "common/dto/settings/Language";

@Component
export default class TranslationInput extends Vue {
    @Prop(Object) public languageSettings!: LanguageSettings;
    @Prop(Map) public languages!: Map<string, string>;

    public currentLanguageSettings: LanguageSettings | null = null;
    public text: string = "";

    @Watch("languageSettings", { immediate: true, deep: true })
    public onLanguageSettingsUpdated(): void {
        this.currentLanguageSettings = this.languageSettings;
    }

    public updateLanguageSettings(updatedLanguageSettings: LanguageSettings): void {
        this.currentLanguageSettings = updatedLanguageSettings;
    }

    public get allLanguages(): ReadonlyArray<Language> {
        const result: Language[] = [];
        for (const [key, value] of this.languages) {
            result.push({ code: key, name: value });
        }
        return result;
    }

    public translate(): void {
        if (!!this.text && !!this.currentLanguageSettings) {
            const request: TranslationRequest = {
                text: this.text,
                isForcedTranslation: false,
                refreshCache: false,
                sourceLanguage: this.currentLanguageSettings.sourceLanguage,
                targetLanguage: this.currentLanguageSettings.targetLanguage
            };
            this.$emit("translate-text", request);
        }
    }

    public playText(): void {
        if (!!this.text && !!this.currentLanguageSettings) {
            const request: PlayTextRequest = {
                text: this.text,
                language: this.currentLanguageSettings.sourceLanguage
            };
            this.$emit("play-text", request);
        }
    }
}