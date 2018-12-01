import { Component, Vue, Prop } from "vue-property-decorator";

import { EditableLanguageSettings } from "common/dto/settings/editable-settings/EditableLanguageSettings";
import { SelectedLanguages } from "components/shared/language-selector/LanguageSelector";

@Component
export default class LanguageSettings extends Vue {
    @Prop(Object)
    public readonly languageSettings!: EditableLanguageSettings;

    public get selectedLanguages(): SelectedLanguages {
        return {
            sourceLanguage: this.languageSettings.sourceLanguage,
            targetLanguage: this.languageSettings.targetLanguage
        };
    }

    public onLanguagesUpdated(languages: SelectedLanguages): void {
        if (languages.sourceLanguage === undefined || languages.targetLanguage === undefined) {
            throw new Error("Language must be selected");
        }

        const updatedSettings: EditableLanguageSettings = {
            sourceLanguage: languages.sourceLanguage,
            targetLanguage: languages.targetLanguage,
            allLanguages: this.languageSettings.allLanguages
        };
        this.$emit("language-settings-updated", updatedSettings);
    }
}