import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import * as _ from "lodash";

import { EditableTagsSettings } from "common/dto/settings/editable-settings/EditableTagsSettings";

@Component
export default class TagsEditor extends Vue {
    @Prop()
    public tagsSettings!: EditableTagsSettings;

    public isTagInputVisible: boolean = false;
    public tagToAdd: string = "";

    private currentTagSettings!: EditableTagsSettings;

    @Watch("tagsSettings", { immediate: true })
    public onTagsSettingsChanged(): void {
        this.currentTagSettings = this.tagsSettings;
    }

    public updateCurrentTags(): void {
        this.$emit("update-tags", this.currentTagSettings.currentTags);
        this.$forceUpdate();
    }

    public removeTag(tagToRemove: string): void {
        this.currentTagSettings.currentTags = this.currentTagSettings.currentTags.filter(tag => tag !== tagToRemove);
        this.updateCurrentTags();
    }

    public addTag(): void {
        if (!this.tagToAdd) {
            return;
        }

        this.currentTagSettings.currentTags.push(this.tagToAdd);
        this.currentTagSettings.currentTags = _.uniq(this.currentTagSettings.currentTags);
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