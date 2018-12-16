<template>
  <modal :show.sync="show$">
    <span slot="header">Merge Records</span>
    <div slot="body" class="merge-candidates">
      Merge candidates:
      <table class="table-striped candidates non-clickable">
        <thead>
          <tr>
            <th class="word-column">Word</th>
            <th class="translation-column">Translation</th>
            <th class="candidates-column">Candidates</th>
          </tr>
        </thead>
        <tbody v-if="mergeCandidates.length !== 0 && !isActionInProgress">
          <tr v-for="candidate of mergeCandidates" :key="candidate.record.id" v-if="mergeCandidates.length">
            <td class="word-column" v-overflow-tooltip>
              <div class="word-holder">{{candidate.record.sentence}}</div>
              <span class="icon icon-flash" v-if="candidate.record.isForcedTranslation" title="Forced Translation"></span>
            </td>
            <td class="translation-column" v-overflow-tooltip>
              <span v-if="!!candidate.record.translation">{{candidate.record.translation}}</span>
              <span v-else class="no-translation">No Translation</span>
            </td>
            <td class="candidates-column">{{candidate.candidates.length}}</td>
          </tr>
        </tbody>
        <tbody v-else-if="!isActionInProgress">
          <tr>
            <td :colspan="3" class="no-records-available">
              No Records to Merge Avialable
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td :colspan="3" class="loading-records-indicator">
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div slot="footer" class="footer">
        <app-button @click="show$ = false" :is-primary="false" :text="'Close'" />
    </div>
  </modal>
</template>

<script src="./HistoryMerger.ts" lang="ts"></script>
<style src="./HistoryMerger.scss" lang="scss" scoped></style>
 