<script setup lang="ts">
import { computed } from 'vue';

import type { TranslationInstance } from '~/components/history/models/history-record.model';

interface Props {
  instances: ReadonlyArray<TranslationInstance>;
}
const props = defineProps<Props>();

const sortedInstances = computed(() =>
  props.instances.slice().sort((a, b) => b.translationDate - a.translationDate)
);
</script>

<template>
  <div class="translation-result-timeline">
    <template v-for="(instance, _index) in sortedInstances" :key="_index">
      <span class="date">{{ $filters.dateTime(instance.translationDate) }}</span>
      <div class="separator">
        <div class="dot"></div>
        <div class="line"></div>
      </div>
      <div class="tags-list">
        <span v-for="tag in instance.tags" :key="tag" class="tag">{{ tag }}</span>
        <span v-if="!instance.tags.length">—</span>
      </div>
    </template>
  </div>
</template>

<style src="./translation-result-timeline.scss" lang="scss" scoped></style>
