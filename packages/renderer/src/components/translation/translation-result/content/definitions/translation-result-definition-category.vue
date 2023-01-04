<script setup lang="ts">
import type { TranslateResultDefinitionCategory } from '~/components/translation/models/translation';

interface Props {
  definitionCategory: TranslateResultDefinitionCategory;
}
defineProps<Props>();
</script>

<template>
  <div class="definitions">
    <div class="definition-header">
      {{ definitionCategory.baseForm }}
      <span class="part-of-speech">- {{ definitionCategory.partOfSpeech }}</span>
    </div>
    <div
      v-for="entry in definitionCategory.entries"
      :key="entry.definition"
      class="definition-entry"
    >
      <div class="definition">{{ entry.definition }}</div>
      <div v-if="!!entry.sample" class="sample">{{ entry.sample }}</div>
      <div v-if="!!entry.synonyms.length" class="synonyms">
        <span class="synonyms-label">synonyms: </span>{{ entry.synonyms.join(', ') }}
      </div>
    </div>
  </div>
</template>

<style src="./translation-result-definition-category.scss" lang="scss" scoped></style>
