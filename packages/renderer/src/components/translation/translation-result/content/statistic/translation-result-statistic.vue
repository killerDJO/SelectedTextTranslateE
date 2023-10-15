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
    <div class="statistics-summary">
      <div class="summary-item">
        <font-awesome-icon icon="hashtag" size="sm" class="icon" />
        <span
          >{{ historyRecord.translationsNumber }} time{{
            historyRecord.translationsNumber > 1 ? 's' : ''
          }}</span
        >
      </div>
      <div class="summary-item">
        <font-awesome-icon icon="globe" size="sm" class="icon" />
        <span
          >{{ languages.get(historyRecord.sourceLanguage) }} ➜
          {{ languages.get(historyRecord.targetLanguage) }}</span
        >
      </div>
      <div class="summary-item">
        <font-awesome-icon :icon="['far', 'calendar']" size="sm" class="icon" />
        <span
          >{{ $filters.dateTime(historyRecord.createdDate) }} ➜
          {{ $filters.dateTime(historyRecord.lastTranslatedDate) }}</span
        >
      </div>
      <div class="summary-item archive-actions">
        <font-awesome-icon
          icon="trash"
          size="sm"
          class="icon"
          :class="{ archived: historyRecord.isArchived }"
        />
        <link-button v-if="!historyRecord.isArchived" :text="'Archive'" @click="$emit('archive')" />
        <link-button v-else :text="'Restore'" @click="$emit('unarchive')" />
        <link-button
          v-if="isEmbedded"
          :text="'Delete Forever'"
          @click="confirmModalInstance?.open()"
        />
      </div>
    </div>
    <div v-if="historyRecord.instances" class="translation-instances">
      <div
        v-for="(instance, index) in historyRecord.instances.slice().reverse()"
        :key="index"
        class="instance"
      >
        At {{ $filters.dateTime(instance.translationDate) }}
        <span v-for="tag in instance.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </div>
  </div>
  <confirm-modal ref="confirmModalInstance" @confirm="$emit('hard-delete')">
    <template #header>Are you sure you want to delete this record?</template>
    <template #body>Record will be deleted forever, including all of the statistics.</template>
  </confirm-modal>
</template>

<style src="./translation-result-statistic.scss" lang="scss" scoped></style>
