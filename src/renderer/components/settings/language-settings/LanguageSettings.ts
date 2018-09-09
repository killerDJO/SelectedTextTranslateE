import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import * as _ from "lodash";

import { EditableLanguageSettings } from "common/dto/settings/editable-settings/EditableLanguageSettings";
import { Language } from "common/dto/settings/Language";

import SettingsHolder from "components/settings/settings-holder/SettingsHolder.vue";

@Component({
    components: {
        SettingsHolder
    }
})
export default class LanguageSettings extends Vue {
    @Prop(Object)
    public readonly languageSettings!: EditableLanguageSettings;

    public readonly currentLanguageSettings: EditableLanguageSettings = _.cloneDeep(this.languageSettings);

    @Watch("currentLanguageSettings", { deep: true })
    public raiseUpdatedEvent(): void {
        this.$emit("language-settings-updated", this.currentLanguageSettings);
    }

    public switchLanguages(): void {
        const originalSourceLanguage = this.currentLanguageSettings.sourceLanguage;
        this.currentLanguageSettings.sourceLanguage = this.currentLanguageSettings.targetLanguage;
        this.currentLanguageSettings.targetLanguage = originalSourceLanguage;
    }

    public get sourceLanguages(): ReadonlyArray<Language> {
        return this.filterLanguages(this.currentLanguageSettings.targetLanguage);
    }

    public get targetLanguages(): ReadonlyArray<Language> {
        return this.filterLanguages(this.currentLanguageSettings.sourceLanguage);
    }

    public filterLanguages(code: string): ReadonlyArray<Language> {
        return _.filter<Language>(this.languageSettings.allLanguages, language => language.code !== code);
    }
}