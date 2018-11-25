import { Component, Prop, Watch } from "vue-property-decorator";
import { DropBase } from "../DropBase";

@Component
export default class Typeahead extends DropBase {
    @Prop({
        type: Number,
        default: 0
    })
    public tabIndex!: number;

    @Prop({
        type: Number,
        default: 3
    })
    public minLength!: number;

    @Prop({
        type: Boolean,
        default: false
    })
    public autoFocus!: boolean;

    @Prop({
        type: Boolean,
        default: false
    })
    public compactView!: boolean;

    @Prop(Array)
    public suggestions!: string[];

    public input: string = "";
    public selectedSuggestionsIndex: number = -1;

    public get input$(): string {
        return this.input;
    }

    public set input$(value: string) {
        this.input = value;
        this.requestSuggestions();
    }

    public requestSuggestions() {
        if (this.input.length >= this.minLength) {
            this.$emit("get-suggestions", this.input);
        } else {
            this.closeDrop();
        }
    }

    @Watch("input")
    public onInputChanged(): void {
        this.$emit("input-changed", this.input);
    }

    @Watch("suggestions", { deep: true, immediate: true })
    public onSuggestionsChanged(): void {
        if (this.suggestions.length > 0) {
            this.selectedSuggestionsIndex = -1;
            this.openDrop();
        } else {
            this.closeDrop();
        }
    }

    public onSelected() {
        if (this.selectedSuggestionsIndex !== -1) {
            this.input = this.suggestions[this.selectedSuggestionsIndex];
            this.selectedSuggestionsIndex = -1;
        } else {
            this.$emit("input-selected", this.input);
        }

        this.closeDrop();
    }

    public suggestionClick(suggestion: string): void {
        (this.$refs.input as HTMLElement).focus();
        this.input = suggestion;
        this.closeDrop();
    }

    public isSuggestionSelected(suggestion: string): boolean {
        if (this.selectedSuggestionsIndex === -1) {
            return false;
        }

        return this.suggestions[this.selectedSuggestionsIndex] === suggestion;
    }

    public selectNextSuggestion(): void {
        this.selectedSuggestionsIndex = this.selectedSuggestionsIndex === -1 ? 0 : (this.selectedSuggestionsIndex + 1) % this.suggestions.length;
    }

    public selectPreviousSuggestion(): void {
        if (this.selectedSuggestionsIndex === -1 || this.selectedSuggestionsIndex === 0) {
            this.selectedSuggestionsIndex = this.suggestions.length - 1;
        } else {
            this.selectedSuggestionsIndex = this.selectedSuggestionsIndex - 1;
        }
    }

    public openDrop(): void {
        this.openDropInternal(this.$refs.dropTarget as Element, this.$refs.dropContent as Element, "bottom", {});
    }
}