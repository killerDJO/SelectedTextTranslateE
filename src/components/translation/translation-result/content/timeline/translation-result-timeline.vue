<script setup lang="ts">
import type { TranslationInstance } from '~/components/history/models/history-record.model';

interface Props {
  instances: ReadonlyArray<TranslationInstance>;
}
defineProps<Props>();
</script>

<template>
  <div class="translation-result-timeline">
    <template v-for="(instance, index) in instances.slice().reverse()" :key="index">
      <span class="date">{{ $filters.dateTime(instance.translationDate) }}</span>
      <div class="separator">
        <div class="dot"></div>
        <div class="line"></div>
      </div>
      <div class="tags-list">
        <span v-for="tag in instance.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </template>
  </div>
</template>

<style src="./translation-result-timeline.scss" lang="scss" scoped></style>
