import Vue from "vue";
import { Prop, Component, Watch } from "vue-property-decorator";

import { TranslationRequest } from "common/dto/translation/TranslationRequest";
import { PlayTextRequest } from "common/dto/translation/PlayTextRequest";
import LanguageSettingsComponent from "components/settings/language-settings/LanguageSettings.vue";
import { EditableLanguageSettings } from "common/dto/settings/editable-settings/EditableLanguageSettings";

@Component({
    components: {
        LanguageSettings: LanguageSettingsComponent
    }
})
export default class TranslationInput extends Vue {
    @Prop(Object) public languageSettings!: EditableLanguageSettings;

    public currentLanguageSettings: EditableLanguageSettings | null = null;
    public text: string = "";

    @Watch("languageSettings", { immediate: true, deep: true })
    public onLanguageSettingsUpdated(): void {
        this.currentLanguageSettings = this.languageSettings;
    }

    public updateLanguageSettings(updatedLanguageSettings: EditableLanguageSettings): void {
        this.currentLanguageSettings = updatedLanguageSettings;
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