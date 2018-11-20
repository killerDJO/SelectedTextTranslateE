import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import * as _ from "lodash";

@Component
export default class TagsEditor extends Vue {
    @Prop()
    public tags!: ReadonlyArray<string>;

    @Prop({
        type: Boolean,
        default: false
    })
    public compactView!: boolean;

    public isTagInputVisible: boolean = false;
    public tagToAdd: string = "";

    private currentTags!: string[];

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

    public addTag(): void {
        if (!this.tagToAdd) {
            return;
        }

        this.currentTags.push(this.tagToAdd);
        this.currentTags = _.uniq(this.currentTags).sort();
        this.tagToAdd = "";
        this.isTagInputVisible = false;
        this.updateCurrentTags();
    }

    public showTagInput(): void {
        this.tagToAdd = "";
        this.isTagInputVisible = true;
    }

    public hideTagInput(): void {
        this.isTagInputVisible = false;
    }
}