<script setup lang="ts">
import type { HistoryRecord } from '~/components/history/models/history-record';

interface Props {
  historyRecord: HistoryRecord;
  languages: Map<string, string>;
}

defineProps<Props>();

defineEmits<{
  (e: 'refresh-translation'): void;
}>();
</script>

<template>
  <div class="statistic">
    <div class="statistics-table">
      <span class="label">Times translated:</span
      ><span class="value">{{ historyRecord.translationsNumber }}</span>
      <span class="label">First translated:</span
      ><span class="value">{{ $filters.dateTime(historyRecord.createdDate) }}</span>
      <span class="label">Last translated:</span
      ><span class="value">{{ $filters.dateTime(historyRecord.lastTranslatedDate) }}</span>
      <span class="label">Last updated:</span
      ><span class="value">{{ $filters.dateTime(historyRecord.updatedDate) }}</span>
      <span class="label">Source Language:</span
      ><span class="value">{{ languages.get(historyRecord.sourceLanguage) }}</span>
      <span class="label">Target Language:</span
      ><span class="value">{{ languages.get(historyRecord.targetLanguage) }}</span>
      <span class="label">Archived:</span
      ><span class="value">{{ historyRecord.isArchived ? 'Yes' : 'No' }}</span>
    </div>
    <link-button
      :text="'Refresh Record'"
      class="refresh-button"
      @click="$emit('refresh-translation')"
    />
  </div>
</template>

<style src="./translation-result-statistic.scss" lang="scss" scoped></style>
