import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import * as _ from "lodash";

import { HistoryFilter } from "common/dto/history/HistoryFilter";
import { Language } from "common/dto/settings/Language";
import { Tag } from "common/dto/history/Tag";

import TagsEditor from "components/history/tags-editor/TagsEditor.vue";
import { SelectedLanguages } from "components/shared/language-selector/LanguageSelector";

@Component({
    components: {
        TagsEditor
    }
})
export default class HistoryFilterComponent extends Vue {
    @Prop(Object)
    public filter!: HistoryFilter;

    @Prop(Map)
    public languages!: Map<string, string>;

    public currentFilter: HistoryFilter = _.cloneDeep(this.filter);
    public validationResult: ValidationResult = {};

    @Watch("filter", { deep: true })
    public onFilterChanged(): void {
        if (!_.isEqual(this.filter, this.currentFilter)) {
            this.currentFilter = _.cloneDeep(this.filter);
        }
    }

    @Watch("currentFilter", { deep: true })
    public onCurrentFilterChanged() {
        this.validate();
        if (this.isValid()) {
            this.$emit("filter-updated", this.currentFilter);
        }
    }

    public get selectedLanguages(): SelectedLanguages {
        return {
            sourceLanguage: this.currentFilter.sourceLanguage,
            targetLanguage: this.currentFilter.targetLanguage
        };
    }

    public setTags(tags: ReadonlyArray<Tag>) {
        this.currentFilter.tags = tags.map(tag => tag.tag);
    }

    public get allLanguages(): ReadonlyArray<Language> {
        const result: Language[] = [];
        for (const [key, value] of this.languages) {
            result.push({ code: key, name: value });
        }
        return result;
    }

    private validate(): void {
        this.validationResult = {};

        if (!!this.currentFilter.minTranslatedTime && !!this.currentFilter.maxTranslatedTime && this.currentFilter.minTranslatedTime > this.currentFilter.maxTranslatedTime) {
            this.validationResult.minTranslatedTime = this.validationResult.maxTranslatedTime = "Minimum number must be lower than maximum number";
        }

        if (!!this.currentFilter.minLastTranslatedDate && !!this.currentFilter.maxLastTranslatedDate && this.currentFilter.minLastTranslatedDate > this.currentFilter.maxLastTranslatedDate) {
            this.validationResult.minLastTranslatedDate = this.validationResult.maxLastTranslatedDate = "Start date must be lower than end date";
        }
    }

    public isValid(): boolean {
        const validationResult = this.validationResult;
        return Object.keys(validationResult).every(result => !validationResult[result]);
    }

    public onLanguagesUpdated(languages: SelectedLanguages): void {
        this.currentFilter = {
            ...this.currentFilter,
            sourceLanguage: languages.sourceLanguage,
            targetLanguage: languages.targetLanguage
        };
    }
}

interface ValidationResult {
    [key: string]: string | undefined;

    minTranslatedTime?: string;
    maxTranslatedTime?: string;

    minLastTranslatedDate?: string;
    maxLastTranslatedDate?: string;
}