import { Component, Prop } from "vue-property-decorator";
import Vue from "vue";

import { TranslateResultCategory, TranslateResultCategoryEntry } from "common/dto/translation/TranslateResult";
import { TranslationViewRendererSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";

@Component
export default class TranslationResultContentCategory extends Vue {

    @Prop(Object)
    public category!: TranslateResultCategory;

    @Prop(Object)
    public translationResultViewSettings!: TranslationViewRendererSettings;

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
        } else {
            return `show ${this.numberOfInitiallyHiddenEntries} more results`;
        }
    }

    public toggleExpansionState(): void {
        this.isExpanded = !this.isExpanded;
    }

    public getScoreClass(entry: TranslateResultCategoryEntry): string {
        if (entry.score >= this.translationResultViewSettings.score.highThreshold) {
            return "high";
        }
        if (entry.score >= this.translationResultViewSettings.score.mediumThreshold) {
            return "medium";
        }
        return "low";
    }

    public translate(text: string): void {
        this.$emit("translate", text);
    }

    private getInitiallyVisibleEntries(): ReadonlyArray<TranslateResultCategoryEntry> {
        return this.category.entries.filter(this.isVisibleEntry, this);
    }

    private isVisibleEntry(entry: TranslateResultCategoryEntry, index: number): boolean {
        return entry.score > this.translationResultViewSettings.visibility.lowScoreThreshold || index < this.translationResultViewSettings.visibility.visibleByDefaultNumber;
    }
}