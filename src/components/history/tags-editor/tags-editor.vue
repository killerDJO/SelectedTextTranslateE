<script setup lang="ts">
import { computed, ref } from 'vue';

import { historyCache } from '~/components/history/services/history-cache.service';
import { Tag } from '~/host/models/settings.model';

interface Props {
  tags: ReadonlyArray<string | Tag>;
  compactView?: boolean;
  clickable?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  compactView: false,
  clickable: false
});

const $emit = defineEmits<{
  (e: 'tag-clicked', tag: Tag): void;
  (e: 'update-tags', tags: Tag[]): void;
}>();

const isTagInputVisible = ref(false);
const currentTag = ref<Tag | null>(null);
const suggestions = ref<string[]>([]);

const currentTags = computed(() => {
  if (!props.tags) {
    return [];
  }

  return props.tags.map(normalizeTag).sort((a, b) => a.tag.localeCompare(b.tag));
});

function onTagClicked(tag: Tag) {
  if (props.clickable) {
    $emit('tag-clicked', tag);
  }
}

function addTag(tag: string | Tag | null): void {
  if (!tag) {
    return;
  }
  isTagInputVisible.value = false;

  const normalizedTag = normalizeTag(tag);
  if (currentTags.value.some(currentTag => currentTag.tag === normalizedTag.tag)) {
    return;
  }

  $emit('update-tags', currentTags.value.concat([normalizedTag]));
}

function removeTag(tagToRemove: Tag): void {
  $emit(
    'update-tags',
    currentTags.value.filter(tag => tag.tag !== tagToRemove.tag)
  );
}

function normalizeTag(tag: Tag | string): Tag {
  return typeof tag === 'string' ? { tag: tag, enabled: true } : tag;
}

function setCurrentTag(tag: string): void {
  currentTag.value = { tag: tag, enabled: true };
}

function addCurrentTag(): void {
  addTag(currentTag.value);
}

async function getSuggestions(input: string): Promise<void> {
  const allTags = await historyCache.getAllTags();
  suggestions.value = allTags.filter(
    tag =>
      !currentTags.value.some(currentTag => currentTag.tag.toLowerCase() === tag.toLowerCase()) &&
      tag.toLowerCase().includes(input.toLowerCase())
  );
}

defineExpose({
  openEditor: () => (isTagInputVisible.value = true)
});
</script>

<template>
  <div class="tags-editor" :class="{ compact: compactView }">
    <span
      v-for="tag in currentTags"
      :key="tag.tag"
      class="tag"
      :class="{ clickable: clickable, disabled: !tag.enabled }"
      tabindex="0"
      @click.stop="onTagClicked(tag)"
      @keyup.enter="onTagClicked(tag)"
    >
      {{ tag.tag }}
      <icon-button :title="'Remove Tag'" class="remove-tag-button" @click="removeTag(tag)">
        <font-awesome-icon icon="xmark" size="sm" class="remove-tag-icon" />
      </icon-button>
    </span>
    <icon-button
      v-if="!isTagInputVisible"
      :title="'Add Tag'"
      class="add-tag-button"
      @click="isTagInputVisible = true"
    >
      <font-awesome-icon icon="plus" size="sm" class="add-tag-icon" />
    </icon-button>
    <div v-focus-lost="() => (isTagInputVisible = false)" class="tag-input-wrapper">
      <app-typeahead
        v-if="isTagInputVisible"
        :suggestions="suggestions"
        :auto-focus="true"
        :compact-view="compactView"
        :min-length="2"
        @get-suggestions="getSuggestions"
        @input-selected="addTag"
        @input-changed="setCurrentTag"
      />
      <icon-button
        v-if="isTagInputVisible"
        :title="'Add Tag'"
        class="confirm-add-tag-button"
        @click="addCurrentTag()"
      >
        <font-awesome-icon icon="check" class="confirm-add-tag-icon" size="sm" />
      </icon-button>
    </div>
  </div>
</template>

<style src="./tags-editor.scss" lang="scss" scoped></style>
