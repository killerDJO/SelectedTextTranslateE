<template>
  <modal :show.sync="show$">
    <span slot="header">Merge Records</span>
    <div slot="body" class="merge-candidates">
      <div v-if="!isCandidateViewVisible" class="candidates-view">
        <div class="candidates-view-header">
          <checkbox v-model="showLanguages" :label="'Show Languages'" />
          <span v-if="filteredCandidates.length > 0" class="records-label">{{filteredCandidates.length}} record{{filteredCandidates.length > 1 ? "s" : ""}}</span>
        </div>
        <data-table :configuration="candidatesTableConfiguration" :records="filteredCandidates" class="candidates" @update-columns-configuration="candidatesTableConfiguration.columns = $event" @record-click="showCandidate">
          <div :slot="getHeaderSlotId(CandidatesTableColumns.Word)">
            <div v-overflow-tooltip class="table-header">Word</div>
          </div>
          <div :slot="getBodySlotId(CandidatesTableColumns.Word)" slot-scope="{ record: candidate }" v-overflow-tooltip>
            {{candidate.record.sentence}} <span class="icon icon-flash" v-if="candidate.record.isForcedTranslation" title="Forced Translation"></span>
          </div>

          <div :slot="getHeaderSlotId(CandidatesTableColumns.Translation)">
            <div v-overflow-tooltip class="table-header">Translation</div>
          </div>
          <div :slot="getBodySlotId(CandidatesTableColumns.Translation)" slot-scope="{ record: candidate }" v-overflow-tooltip>
            <span v-if="!!candidate.record.translation">{{candidate.record.translation}}</span>
            <span v-if="candidate.record.suggestion !== null" class="suggestion">(suggested: {{candidate.record.suggestion}})</span>
            <span v-if="!candidate.record.translation" class="no-translation">No Translation</span>
          </div>

          <div :slot="getHeaderSlotId(CandidatesTableColumns.SourceLanguage)">
            <div v-overflow-tooltip class="table-header">Source</div>
          </div>
          <div :slot="getBodySlotId(CandidatesTableColumns.SourceLanguage)" slot-scope="{ record: candidate }" v-overflow-tooltip>
            {{languages.get(candidate.record.sourceLanguage) || candidate.record.sourceLanguage}}
          </div>

          <div :slot="getHeaderSlotId(CandidatesTableColumns.TargetLanguage)">
            <div v-overflow-tooltip class="table-header">Target</div>
          </div>
          <div :slot="getBodySlotId(CandidatesTableColumns.TargetLanguage)" slot-scope="{ record: candidate }" v-overflow-tooltip>
            {{languages.get(candidate.record.targetLanguage) || candidate.record.targetLanguage}}
          </div>

          <div :slot="getHeaderSlotId(CandidatesTableColumns.Candidates)" class="candidates-column">
            <div v-overflow-tooltip class="table-header">Candidates</div>
          </div>
          <div :slot="getBodySlotId(CandidatesTableColumns.Candidates)" slot-scope="{ record: candidate }" class="candidates-column">
            {{candidate.mergeRecords.length}}
          </div>

          <div slot="empty" class="no-records-available">
            No Records to Merge Avialable
          </div>
        </data-table>
      </div>
      <div class="candidate-view" v-if="isCandidateViewVisible">
        <div class="candidate-view-header">
          <icon-button @click="backToCandidates" :title="'Back'">
            <i class="icon icon-left back-button"></i>
          </icon-button>
          Back
        </div>
        <data-table :configuration="candidateTableConfiguration" :records="currentMergeRecords" class="candidate" @update-columns-configuration="candidateTableConfiguration.columns = $event">
          <div :slot="getHeaderSlotId(CandidateTableColumns.Word)">
            <div v-overflow-tooltip class="table-header">Word</div>
          </div>
          <div :slot="getBodySlotId(CandidateTableColumns.Word)" slot-scope="{ record: mergeRecord }" v-overflow-tooltip>
            {{mergeRecord.sentence}} <span class="icon icon-flash" v-if="mergeRecord.isForcedTranslation" title="Forced Translation"></span>
          </div>

          <div :slot="getHeaderSlotId(CandidateTableColumns.Translation)">
            <div v-overflow-tooltip class="table-header">Translation</div>
          </div>
          <div :slot="getBodySlotId(CandidateTableColumns.Translation)" slot-scope="{ record: mergeRecord }" v-overflow-tooltip>
            <span v-if="!!mergeRecord.translation">{{mergeRecord.translation}}</span>
            <span v-if="mergeRecord.suggestion !== null" class="suggestion">(suggested: {{mergeRecord.suggestion}})</span>
            <span v-if="!mergeRecord.translation" class="no-translation">No Translation</span>
          </div>

          <div :slot="getHeaderSlotId(CandidateTableColumns.Times)" class="times-column">
            <div v-overflow-tooltip class="table-header">Times</div>
          </div>
          <div :slot="getBodySlotId(CandidateTableColumns.Times)" slot-scope="{ record: mergeRecord }" v-overflow-tooltip class="times-column">
            {{mergeRecord.translationsNumber}}
          </div>

          <div :slot="getHeaderSlotId(CandidateTableColumns.Actions)" class="actions-column">
            <div v-overflow-tooltip class="table-header">Actions</div>
          </div>
          <div :slot="getBodySlotId(CandidateTableColumns.Actions)" slot-scope="{ record: mergeRecord, index }" v-overflow-tooltip class="actions-column">
            <div v-if="index > 0">
              <link-button @click="merge(mergeRecord)" :text="'Merge'" />
              <link-button @click="blacklist(mergeRecord)" :text="'Ignore'" />
              <link-button @click="promote(mergeRecord)" :text="'Promote'" />
            </div>
            <div v-else>
              <link-button @click="blacklistAll()" :text="'Ignore All'" />
              <link-button @click="mergeAll()" :text="'Merge All'" />
            </div>
          </div>
        </data-table>
      </div>
    </div>
    <div slot="footer" class="footer">
        <app-button @click="show$ = false" :is-primary="false" :text="'Close'" />
    </div>
  </modal>
</template>

<script src="./HistoryMerger.ts" lang="ts"></script>
<style src="./HistoryMerger.scss" lang="scss" scoped></style>
 