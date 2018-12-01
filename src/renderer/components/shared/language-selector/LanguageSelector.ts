import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import * as _ from "lodash";

import { Language } from "common/dto/settings/Language";
import SingleLanguageSelector from "./single-language-selector/SingleLanguageSelector.vue";

export interface SelectedLanguages {
    sourceLanguage?: string;
    targetLanguage?: string;
}

export interface LanguageItem {
    value: string | undefined;
    name: string;
}

@Component({
    components: {
        SingleLanguageSelector
    }
})
export default class LanguageSelector extends Vue {
    @Prop(Object)
    public readonly languages!: SelectedLanguages;

    @Prop(Array)
    public readonly allLanguages!: ReadonlyArray<Language>;

    @Prop({
        type: Boolean,
        default: false
    })
    public readonly allowUnselect!: boolean;

    public readonly currentLanguages: SelectedLanguages = _.cloneDeep(this.languages);

    @Watch("currentLanguages", { deep: true })
    public raiseUpdatedEvent(): void {
        this.$emit("languages-updated", this.currentLanguages);
    }

    public switchLanguages(): void {
        const originalSourceLanguage = this.currentLanguages.sourceLanguage;
        this.currentLanguages.sourceLanguage = this.currentLanguages.targetLanguage;
        this.currentLanguages.targetLanguage = originalSourceLanguage;
    }

    public get sourceLanguages(): ReadonlyArray<LanguageItem> {
        return this.filterLanguages(this.currentLanguages.targetLanguage);
    }

    public get targetLanguages(): ReadonlyArray<LanguageItem> {
        return this.filterLanguages(this.currentLanguages.sourceLanguage);
    }

    public filterLanguages(code?: string): ReadonlyArray<LanguageItem> {
        const languageItems: LanguageItem[] = this.allLanguages.map(language => ({ value: language.code, name: language.name }));

        if (this.allowUnselect) {
            languageItems.unshift({
                value: undefined,
                name: "Not Specified"
            });
        }

        return languageItems.filter(item => !code || item.value !== code);
    }
}