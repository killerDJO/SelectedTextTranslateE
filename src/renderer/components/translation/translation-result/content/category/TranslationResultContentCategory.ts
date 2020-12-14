import { Component, Prop } from "vue-property-decorator";
import Vue from "vue";

import { TranslateResultCategory, TranslateResultCategoryEntry } from "common/dto/translation/TranslateResult";
import { TranslateResultRendererSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";

@Component
export default class TranslationResultContentCategory extends Vue {

    @Prop(Object)
    public category!: TranslateResultCategory;

    @Prop(Object)
    public translationResultViewSettings!: TranslateResultRendererSettings;

    public isExpanded: boolean = false;

    public get visibleEntries(): ReadonlyArray<TranslateResultCategoryEntry> {
        if (this.isExpanded) {
            return this.category.entries;
        }

        return this.getInitiallyVisibleEntries();
    }

    public get hasInitiallyHiddenEntries(): boolean {
        return this.numberOfInitiallyHiddenEntries !== 0;
    }

    public get numberOfInitiallyHiddenEntries(): number {
        return this.category.entries.length - this.getInitiallyVisibleEntries().length;
    }

    public get expandButtonText(): string {
        if (this.isExpanded) {
            return "show less results";
        }

        if (this.numberOfInitiallyHiddenEntries === 1) {
            return "show 1 more result";
        }

        return `show ${this.numberOfInitiallyHiddenEntries} more results`;
    }

    public toggleExpansionState(): void {
        this.isExpanded = !this.isExpanded;
    }

    public getScoreClass(entry: TranslateResultCategoryEntry): string {
        const scoreClasses = ["high", "medium", "low"];
        return scoreClasses[entry.score - 1];
    }

    public translate(text: string): void {
        this.$emit("translate", text);
    }

    private getInitiallyVisibleEntries(): ReadonlyArray<TranslateResultCategoryEntry> {
        return this.category.entries.filter(this.isVisibleEntry, this);
    }

    private isVisibleEntry(entry: TranslateResultCategoryEntry, index: number): boolean {
        const LowScoreValue = 3;
        return entry.score < LowScoreValue || index < this.translationResultViewSettings.visibility.visibleByDefaultNumber;
    }
}