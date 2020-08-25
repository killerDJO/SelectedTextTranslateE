import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import * as _ from "lodash";

import { MessageBus } from "common/renderer/MessageBus";
import { Messages } from "common/messaging/Messages";
import { Tag } from "common/dto/history/Tag";

@Component
export default class TagsEditor extends Vue {
    @Prop()
    public tags!: ReadonlyArray<string | Tag>;

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

    private currentTags!: Tag[];
    private currentTag: Tag | null = null;
    private readonly messageBus: MessageBus = new MessageBus();

    public mounted() {
        this.$emit("set-show-tag-input", this.showTagInput);
    }

    @Watch("tags", { immediate: true })
    public onTagsSettingsChanged(): void {
        this.currentTags = this.mapTags(this.tags);
        this.sortCurrentTags();
        this.$forceUpdate();
    }

    public updateCurrentTags(): void {
        this.$emit("update-tags", this.currentTags);
        this.$forceUpdate();
    }

    public removeTag(tagToRemove: Tag): void {
        this.currentTags = this.currentTags.filter(tag => tag.tag !== tagToRemove.tag);
        this.updateCurrentTags();
    }

    public setCurrentTag(tag: string): void {
        this.currentTag = { tag: tag, isEnabled: true };
    }

    public addCurrentTag(): void {
        this.addTag(this.currentTag);
    }

    public onTagClicked(tag: Tag) {
        if (this.clickable) {
            this.$emit("tag-clicked", tag);
        }
    }

    public addTag(tag: string | Tag | null): void {
        if (!tag) {
            return;
        }
        const normalizedTag = _.isString(tag) ? { tag: tag, isEnabled: true } : tag;
        if (this.currentTags.some(currentTag => currentTag.tag === normalizedTag.tag)) {
            return;
        }

        this.currentTags.push(normalizedTag);
        this.sortCurrentTags();
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

    private mapTags(tags: ReadonlyArray<string | Tag>): Tag[] {
        if (!tags) {
            return [];
        }

        return tags.map(tag => _.isString(tag) ? { tag: tag, isEnabled: true } : { ...tag });
    }

    private sortCurrentTags(): void {
        this.currentTags.sort((a, b) => a.tag.localeCompare(b.tag));
    }
}