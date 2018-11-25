import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Popper from "popper.js";

@Component
export default class Typeahead extends Vue {
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

    @Prop(Array)
    public suggestions!: string[];

    public input: string = "";
    public selectedSuggestionsIndex: number = -1;

    private drop: Popper | null = null;

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
            this.$emit("suggestion-selected", this.input);
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
        this.drop = new Popper(this.$refs.dropTarget as Element, this.$refs.dropContent as Element, {
            placement: "bottom",
            positionFixed: false,
            modifiers: {
                computeStyle: {
                    gpuAcceleration: false
                },
                preventOverflow: {
                    boundariesElement: document.querySelector(".view") as Element
                }
            }
        });
    }

    public closeDrop(): void {
        if (this.drop !== null) {
            this.drop.destroy();
            this.drop = null;
        }
    }

    public beforeDestroy(): void {
        this.closeDrop();
    }
}