<template>
  <modal :show.sync="show$">
    <span slot="header">Merge Records</span>
    <div slot="body" class="merge-candidates">
      <div v-if="!isCandidateViewVisible" class="candidates-view">
        <div class="candidates-view-header">
          <checkbox v-model="showLanguages" :label="'Show Languages'" />
        </div>
        <table class="table-striped candidates non-clickable">
          <thead>
            <tr>
              <th class="word-column">Word</th>
              <th class="translation-column">Translation</th>
              <th class="source-language-column" v-if="showLanguages">Source</th>
              <th class="target-language-column" v-if="showLanguages">Target</th>
              <th class="candidates-column">Candidates</th>
            </tr>
          </thead>
          <tbody v-if="mergeCandidates.length !== 0 && !isActionInProgress">
            <tr v-for="candidate of mergeCandidates" :key="candidate.record.id" v-if="candidate.mergeRecords.length" @click="showCandidate(candidate)">
              <td class="word-column" v-overflow-tooltip>
                <div class="word-holder">{{candidate.record.sentence}}</div>
                <span class="icon icon-flash" v-if="candidate.record.isForcedTranslation" title="Forced Translation"></span>
              </td>
              <td class="translation-column" v-overflow-tooltip>
                <span v-if="!!candidate.record.translation">{{candidate.record.translation}}</span>
                <span v-else class="no-translation">No Translation</span>
              </td>
              <td class="source-language-column" v-overflow-tooltip v-if="showLanguages">{{languages.get(candidate.record.sourceLanguage) || candidate.record.sourceLanguage}}</td>
              <td class="target-language-column" v-overflow-tooltip v-if="showLanguages">{{languages.get(candidate.record.targetLanguage) || candidate.record.targetLanguage}}</td>
              <td class="candidates-column">{{candidate.mergeRecords.length}}</td>
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
      <div class="candidate-view" v-if="isCandidateViewVisible">
        <div class="candidate-view-header">
          <icon-button @click="backToCandidates" :title="'Back'">
            <i class="icon icon-left back-button"></i>
          </icon-button>
          Merge candidates for <span class="sentence">{{currentCandidate.record.sentence}}</span>
        </div>
        <table class="table-striped candidate non-clickable">
          <thead>
            <tr>
              <th class="word-column">Word</th>
              <th class="translation-column">Translation</th>
              <th class="times-column">Times</th>
              <th class="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody v-if="currentCandidate.mergeRecords.length > 0">
            <tr v-for="mergeRecord of currentCandidate.mergeRecords" :key="mergeRecord.id">
              <td class="word-column" v-overflow-tooltip>
                <div class="word-holder">{{mergeRecord.sentence}}</div>
                <span class="icon icon-flash" v-if="mergeRecord.isForcedTranslation" title="Forced Translation"></span>
              </td>
              <td class="translation-column" v-overflow-tooltip>
                <span v-if="!!mergeRecord.translation">{{mergeRecord.translation}}</span>
                <span v-else class="no-translation">No Translation</span>
              </td>
              <td class="times-column">{{mergeRecord.translationsNumber}}</td>
              <td class="actions-column">
                <link-button @click="merge(mergeRecord)" :text="'Merge'" />
                <link-button @click="ignore(mergeRecord)" :text="'Ignore'" />
                <link-button @click="promote(mergeRecord)" :text="'Promote'" />
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td :colspan="4" class="no-records-available">
                No Records to Merge Avialable
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div slot="footer" class="footer">
        <app-button @click="show$ = false" :is-primary="false" :text="'Close'" />
    </div>
  </modal>
</template>

<script src="./HistoryMerger.ts" lang="ts"></script>
<style src="./HistoryMerger.scss" lang="scss" scoped></style>
 