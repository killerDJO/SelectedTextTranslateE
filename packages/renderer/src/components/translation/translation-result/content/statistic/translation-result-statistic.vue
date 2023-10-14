<script setup lang="ts">
import { ref } from 'vue';

import type { HistoryRecord } from '~/components/history/models/history-record.model';
import type ConfirmModal from '~/components/shared/confirm-modal/confirm-modal.vue';

interface Props {
  historyRecord: HistoryRecord;
  languages: Map<string, string>;
  isEmbedded: boolean;
}
defineProps<Props>();

defineEmits<{
  (e: 'hard-delete'): void;
  (e: 'archive'): void;
  (e: 'unarchive'): void;
}>();

const confirmModalInstance = ref<InstanceType<typeof ConfirmModal> | null>(null);
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
    <div class="statistic-actions">
      <link-button v-if="!historyRecord.isArchived" :text="'Archive'" @click="$emit('archive')" />
      <link-button v-else :text="'Unarchive'" @click="$emit('unarchive')" />
      <link-button
        v-if="isEmbedded"
        :text="'Delete Forever'"
        @click="confirmModalInstance?.open()"
      />
    </div>
  </div>
  <confirm-modal ref="confirmModalInstance" @confirm="$emit('hard-delete')">
    <template #header>Are you sure you want to delete this record?</template>
    <template #body>Record will be deleted forever, including all of the statistics.</template>
  </confirm-modal>
</template>

<style src="./translation-result-statistic.scss" lang="scss" scoped></style>
