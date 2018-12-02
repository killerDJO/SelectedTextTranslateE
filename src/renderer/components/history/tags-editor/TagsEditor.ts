import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import * as _ from "lodash";

import { MessageBus } from "common/renderer/MessageBus";
import { Messages } from "common/messaging/Messages";

@Component
export default class TagsEditor extends Vue {
    @Prop()
    public tags!: ReadonlyArray<string>;

    @Prop({
        type: Boolean,
        default: false
    })
    public compactView!: boolean;

    @Prop({
        type: Boolean,
        default: false
    })
    public clickable!: boolean;

    public isTagInputVisible: boolean = false;
    public suggestions: ReadonlyArray<string> = [];

    private currentTags!: string[];
    private currentTag: string = "";
    private readonly messageBus: MessageBus = new MessageBus();

    @Watch("tags", { immediate: true })
    public onTagsSettingsChanged(): void {
        this.currentTags = (this.tags || []).slice();
        this.currentTags.sort();
        this.$forceUpdate();
    }

    public updateCurrentTags(): void {
        this.$emit("update-tags", this.currentTags);
        this.$forceUpdate();
    }

    public removeTag(tagToRemove: string): void {
        this.currentTags = this.currentTags.filter(tag => tag !== tagToRemove);
        this.updateCurrentTags();
    }

    public setCurrentTag(tag: string): void {
        this.currentTag = tag;
    }

    public addCurrentTag(): void {
        this.addTag(this.currentTag);
    }

    public onTagClicked(tag: string) {
        if (this.clickable) {
            this.$emit("tag-clicked", tag);
        }
    }

    public addTag(tag: string): void {
        if (!tag) {
            return;
        }

        this.currentTags.push(tag);
        this.currentTags = _.uniq(this.currentTags).sort();
        this.isTagInputVisible = false;
        this.updateCurrentTags();
    }

    public showTagInput(): void {
        this.suggestions = [];
        this.isTagInputVisible = true;
    }

    public hideTagInput(): void {
        this.isTagInputVisible = false;
    }

    public getSuggestions(input: string): void {
        this.messageBus
            .sendCommand<string, ReadonlyArray<string>>(Messages.TranslateResult.GetTagSuggestions, input)
            .then(suggestions => this.suggestions = suggestions);
    }
}