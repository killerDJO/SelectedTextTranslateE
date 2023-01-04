<script setup lang="ts">
import { computed, ref } from 'vue';

import { useAppStore } from '~/app.store';
import type { DataTableConfig } from '~/components/shared/data-table/data-table.vue';
import ForcedTranslationIcon from '~/components/history/icons/forced-translation-icon.vue';

import { useHistoryMergerStore } from './history-merger.store';
import type { MergeCandidate, MergeHistoryRecord } from './models/merge-candidate';

enum CandidatesTableColumns {
  Word = 'word',
  Translation = 'translation',
  SourceLanguage = 'source-language',
  TargetLanguage = 'target-language',
  Candidates = 'candidates'
}
enum CandidateTableColumns {
  Word = 'word',
  Translation = 'translation',
  Times = 'times',
  Actions = 'actions'
}

const historyMerger = useHistoryMergerStore();
const languages = useAppStore().settings.supportedLanguages;

const isVisible = ref(false);
const currentCandidateIndex = ref(-1);
const showLanguages = ref(false);

const filteredCandidates = computed(() => {
  return historyMerger.mergeCandidates.filter(candidate => candidate.mergeRecords.length > 0);
});
const currentCandidate = computed(() => {
  return filteredCandidates.value[currentCandidateIndex.value] || null;
});
const currentMergeRecords = computed(() => {
  if (currentCandidate.value === null) {
    throw Error('Invalid action.');
  }

  return [currentCandidate.value.record].concat(currentCandidate.value.mergeRecords);
});
const candidatesTableConfiguration = computed<DataTableConfig>(() => {
  return {
    columns: [
      { id: CandidatesTableColumns.Word, isVisible: true, weight: 1 },
      { id: CandidatesTableColumns.Translation, isVisible: true, weight: 1 },
      { id: CandidatesTableColumns.SourceLanguage, isVisible: showLanguages.value, weight: 0.5 },
      { id: CandidatesTableColumns.TargetLanguage, isVisible: showLanguages.value, weight: 0.5 },
      { id: CandidatesTableColumns.Candidates, isVisible: true, weight: 0.5 }
    ]
  };
});
const candidateTableConfiguration = computed<DataTableConfig>(() => {
  return {
    columns: [
      { id: CandidateTableColumns.Word, isVisible: true, weight: 1 },
      { id: CandidateTableColumns.Translation, isVisible: true, weight: 1 },
      { id: CandidateTableColumns.Times, isVisible: true, weight: 0.5 },
      { id: CandidateTableColumns.Actions, isVisible: true, weight: 1 }
    ],
    clickable: false
  };
});

function showCandidate(candidate: MergeCandidate): void {
  currentCandidateIndex.value = filteredCandidates.value.indexOf(candidate);
}

function getHeaderSlotId(column: string): string {
  return `header.${column}`;
}

function getBodySlotId(column: string): string {
  return `body.${column}`;
}

function backToCandidates(): void {
  currentCandidateIndex.value = -1;
}

function nextCandidate(): void {
  if (isNextCandidateEnabled()) {
    currentCandidateIndex.value++;
  }
}

function previousCandidate(): void {
  if (isPreviousCandidateEnabled()) {
    currentCandidateIndex.value--;
  }
}

function isNextCandidateEnabled(): boolean {
  return (
    currentCandidateIndex.value !== -1 &&
    currentCandidateIndex.value < filteredCandidates.value.length - 1
  );
}

function isPreviousCandidateEnabled(): boolean {
  return currentCandidateIndex.value !== -1 && currentCandidateIndex.value !== 0;
}

function merge(mergeRecord: MergeHistoryRecord): void {
  executeAction(mergeRecord, candidate =>
    historyMerger.mergeRecords(mergeRecord.id, candidate.record.id)
  );
}

function blacklist(mergeRecord: MergeHistoryRecord): void {
  executeAction(mergeRecord, candidate =>
    historyMerger.blacklistRecords(mergeRecord.id, candidate.record.id)
  );
}

function blacklistAll(): void {
  executeBulkAction(blacklist);
}

function mergeAll(): void {
  executeBulkAction(merge);
}

function promote(mergeRecord: MergeHistoryRecord): void {
  if (currentCandidate.value === null) {
    throw Error('Unable to promote when candidate is not selected');
  }

  promoteRecordToCandidate(currentCandidate.value, mergeRecord);
}

function executeAction(
  mergeRecord: MergeHistoryRecord,
  action: (candidate: MergeCandidate) => void
): void {
  if (currentCandidate.value === null) {
    throw Error('Unable to execute when candidate is not selected');
  }

  action(currentCandidate.value);

  removeRecordFromCandidate(currentCandidate.value, mergeRecord);

  if (currentCandidate.value === null) {
    if (isNextCandidateEnabled()) {
      nextCandidate();
    } else if (isPreviousCandidateEnabled()) {
      previousCandidate();
    } else {
      backToCandidates();
    }
  }
}

function executeBulkAction(action: (record: MergeHistoryRecord) => void): void {
  if (currentCandidate.value === null) {
    throw Error('Unable to execute when candidate is not selected');
  }

  currentCandidate.value.mergeRecords.forEach(action);
}

function removeRecordFromCandidate(candidate: MergeCandidate, record: MergeHistoryRecord): void {
  const currentCandidateIndex = historyMerger.mergeCandidates.indexOf(candidate);

  historyMerger.mergeCandidates[currentCandidateIndex] = {
    id: candidate.record.id,
    record: candidate.record,
    mergeRecords: candidate.mergeRecords.filter(mergeRecord => mergeRecord !== record)
  };
}

function promoteRecordToCandidate(candidate: MergeCandidate, record: MergeHistoryRecord): void {
  const currentCandidateIndex = historyMerger.mergeCandidates.indexOf(candidate);
  historyMerger.mergeCandidates[currentCandidateIndex] = {
    id: record.id,
    record: record,
    mergeRecords: candidate.mergeRecords
      .filter(mergeRecord => mergeRecord !== record)
      .concat([candidate.record])
  };
}

defineExpose({
  open: async () => {
    currentCandidateIndex.value = -1;
    isVisible.value = true;
    await historyMerger.fetchCandidates();
  }
});
</script>

<template>
  <app-modal v-model:show="isVisible">
    <template #header>Merge Records</template>
    <template #body>
      <div class="merge-candidates" :class="{ 'no-records': !filteredCandidates?.length }">
        <div v-if="!currentCandidate" class="candidates-view">
          <div v-if="filteredCandidates?.length" class="candidates-view-header">
            <app-checkbox v-model:value="showLanguages" :label="'Show Languages'" />
            <span v-if="filteredCandidates.length > 0" class="records-label"
              >{{ filteredCandidates.length }} record{{
                filteredCandidates.length > 1 ? 's' : ''
              }}</span
            >
          </div>

          <data-table
            :configuration="candidatesTableConfiguration"
            :records="filteredCandidates"
            :is-loading="historyMerger.isActionInProgress"
            class="candidates"
            @record-click="(record: any) => showCandidate(record)"
          >
            <template #[getHeaderSlotId(CandidatesTableColumns.Word)]>
              <div v-overflow-tooltip class="table-header">Word</div>
            </template>
            <template #[getBodySlotId(CandidatesTableColumns.Word)]="{ record: candidate }">
              <div v-overflow-tooltip>
                {{ candidate.record.sentence }}
                <forced-translation-icon v-if="candidate.record.isForcedTranslation" />
              </div>
            </template>
            <template #[getHeaderSlotId(CandidatesTableColumns.Translation)]>
              <div v-overflow-tooltip class="table-header">Translation</div>
            </template>
            <template #[getBodySlotId(CandidatesTableColumns.Translation)]="{ record: candidate }">
              <div v-overflow-tooltip>
                <span v-if="!!candidate.record.translation">{{
                  candidate.record.translation
                }}</span>
                <span v-if="!!candidate.record.suggestion" class="suggestion"
                  >(suggested: {{ candidate.record.suggestion }})</span
                >
                <span v-if="!candidate.record.translation" class="no-translation"
                  >No Translation</span
                >
              </div>
            </template>
            <template #[getHeaderSlotId(CandidatesTableColumns.SourceLanguage)]>
              <div v-overflow-tooltip class="table-header">Source</div>
            </template>
            <template
              #[getBodySlotId(CandidatesTableColumns.SourceLanguage)]="{ record: candidate }"
            >
              <div v-overflow-tooltip>
                {{
                  languages.get(candidate.record.sourceLanguage) || candidate.record.sourceLanguage
                }}
              </div>
            </template>
            <template #[getHeaderSlotId(CandidatesTableColumns.TargetLanguage)]>
              <div v-overflow-tooltip class="table-header">Target</div>
            </template>
            <template
              #[getBodySlotId(CandidatesTableColumns.TargetLanguage)]="{ record: candidate }"
            >
              <div v-overflow-tooltip>
                {{
                  languages.get(candidate.record.targetLanguage) || candidate.record.targetLanguage
                }}
              </div>
            </template>
            <template #[getHeaderSlotId(CandidatesTableColumns.Candidates)]>
              <div v-overflow-tooltip class="table-header candidates-column">Candidates</div>
            </template>
            <template #[getBodySlotId(CandidatesTableColumns.Candidates)]="{ record: candidate }">
              <div class="candidates-column">
                {{ candidate.mergeRecords.length }}
              </div>
            </template>
            <template #empty
              ><div class="no-records-available">No Records to Merge Available</div></template
            >
          </data-table>
        </div>
        <div v-if="currentCandidate" class="candidate-view">
          <div class="candidate-view-header">
            <link-button :text="'Back To List'" @click="backToCandidates" />
          </div>
          <div class="candidate-view-controls">
            <icon-button
              :title="'Previous'"
              :disabled="!isPreviousCandidateEnabled()"
              class="navigation-button"
              @click="previousCandidate"
            >
              <font-awesome-icon icon="arrow-left" size="xs" class="icon"></font-awesome-icon>
            </icon-button>
            <icon-button
              :title="'Next'"
              :disabled="!isNextCandidateEnabled()"
              class="navigation-button"
              @click="nextCandidate"
            >
              <font-awesome-icon icon="arrow-right" size="xs" class="icon"></font-awesome-icon>
            </icon-button>
          </div>
          <data-table
            :configuration="candidateTableConfiguration"
            :records="currentMergeRecords"
            class="candidate"
          >
            <template #[getHeaderSlotId(CandidateTableColumns.Word)]>
              <div v-overflow-tooltip class="table-header">Word</div>
            </template>
            <template #[getBodySlotId(CandidateTableColumns.Word)]="{ record: mergeRecord }">
              <div v-overflow-tooltip>
                {{ mergeRecord.sentence }}
                <forced-translation-icon v-if="mergeRecord.isForcedTranslation" />
              </div>
            </template>
            <template #[getHeaderSlotId(CandidateTableColumns.Translation)]>
              <div v-overflow-tooltip class="table-header">Translation</div>
            </template>
            <template #[getBodySlotId(CandidateTableColumns.Translation)]="{ record: mergeRecord }">
              <div v-overflow-tooltip>
                <span v-if="!!mergeRecord.translation">{{ mergeRecord.translation }}</span>
                <span v-if="!!mergeRecord.suggestion" class="suggestion">
                  &nbsp;(suggested: {{ mergeRecord.suggestion }})</span
                >
                <span v-if="!mergeRecord.translation" class="no-translation">No Translation</span>
              </div>
            </template>
            <template #[getHeaderSlotId(CandidateTableColumns.Times)]>
              <div v-overflow-tooltip class="table-header times-column">Times</div>
            </template>
            <template #[getBodySlotId(CandidateTableColumns.Times)]="{ record: mergeRecord }">
              <div v-overflow-tooltip class="times-column">
                {{ mergeRecord.translationsNumber }}
              </div>
            </template>
            <template #[getHeaderSlotId(CandidateTableColumns.Actions)]>
              <div v-overflow-tooltip class="table-header actions-column">Actions</div>
            </template>
            <template
              #[getBodySlotId(CandidateTableColumns.Actions)]="{ record: mergeRecord, index }"
            >
              <div v-overflow-tooltip class="actions-column">
                <template v-if="index > 0">
                  <link-button :text="'Merge'" @click="merge(mergeRecord)" />
                  <link-button :text="'Ignore'" @click="blacklist(mergeRecord)" />
                  <link-button :text="'Promote'" @click="promote(mergeRecord)" />
                </template>
                <template v-else>
                  <link-button :text="'Ignore All'" @click="blacklistAll()" />
                  <link-button :text="'Merge All'" @click="mergeAll()" />
                </template>
              </div>
            </template>
          </data-table>
        </div>
      </div>
      <div class="footer">
        <app-button :primary="false" :text="'Close'" @click="isVisible = false" />
      </div>
    </template>
  </app-modal>
</template>

<style src="./history-merger.scss" lang="scss" scoped></style>
