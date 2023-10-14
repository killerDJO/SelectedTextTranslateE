<script setup lang="ts">
import { computed, ref } from 'vue';

import type { TranslateResultRendererSettings } from '@selected-text-translate/common';

import type {
  TranslateResultCategory,
  TranslateResultCategoryEntry
} from '~/components/translation/models/translation.model';

interface Props {
  category: TranslateResultCategory;
  settings: TranslateResultRendererSettings;
}
const props = defineProps<Props>();

defineEmits<{
  (e: 'translate', text: string): void;
}>();

const isExpanded = ref(false);

const visibleEntries = computed(() => {
  if (isExpanded.value) {
    return props.category.entries;
  }

  return getInitiallyVisibleEntries();
});
const numberOfInitiallyHiddenEntries = computed(
  () => props.category.entries.length - getInitiallyVisibleEntries().length
);
const hasInitiallyHiddenEntries = computed(() => numberOfInitiallyHiddenEntries.value !== 0);
const expandButtonText = computed(() => {
  if (isExpanded.value) {
    return 'show less results';
  }

  if (numberOfInitiallyHiddenEntries.value === 1) {
    return 'show 1 more result';
  }

  return `show ${numberOfInitiallyHiddenEntries.value} more results`;
});

function getScoreClass(entry: TranslateResultCategoryEntry): string {
  const scoreClasses = ['high', 'medium', 'low'];
  return scoreClasses[entry.score - 1];
}

function getInitiallyVisibleEntries(): ReadonlyArray<TranslateResultCategoryEntry> {
  return props.category.entries.filter(isVisibleEntry);
}

function isVisibleEntry(entry: TranslateResultCategoryEntry, index: number): boolean {
  const LowScoreValue = 3;
  return entry.score < LowScoreValue || index < props.settings.visibility.visibleByDefaultNumber;
}
</script>

<template>
  <div class="category">
    <div class="category-header">
      {{ category.baseForm }} <span class="part-of-speech">- {{ category.partOfSpeech }}</span>
    </div>
    <div v-for="entry in visibleEntries" :key="entry.word" class="category-entry">
      <span class="score" :class="getScoreClass(entry)"></span>{{ entry.word }}
      <span class="reverse-translations"
        >-
        <span
          v-for="(reverseTranslation, index) in entry.reverseTranslations"
          :key="reverseTranslation"
        >
          <span class="reverse-translation" @click="$emit('translate', reverseTranslation)">{{
            reverseTranslation
          }}</span
          >{{ index !== entry.reverseTranslations.length - 1 ? ', ' : '' }}
        </span>
      </span>
    </div>
    <link-button
      v-if="hasInitiallyHiddenEntries"
      :text="expandButtonText"
      class="expand"
      @click="isExpanded = !isExpanded"
    />
  </div>
</template>

<style src="./translation-result-content-category.scss" lang="scss" scoped></style>
