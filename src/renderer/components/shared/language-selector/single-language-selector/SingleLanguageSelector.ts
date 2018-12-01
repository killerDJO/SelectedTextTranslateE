import { Component, Vue, Prop } from "vue-property-decorator";
import * as _ from "lodash";

import { LanguageItem } from "../LanguageSelector";

@Component
export default class SingleLanguageSelector extends Vue {
    @Prop(String)
    public readonly selectedLanguage!: string;

    @Prop(Array)
    public readonly allLanguages!: ReadonlyArray<LanguageItem>;

    public get selectedLanguage$(): string {
        return this.selectedLanguage;
    }

    public set selectedLanguage$(language: string) {
        this.$emit("update:selectedLanguage", language);
    }
}