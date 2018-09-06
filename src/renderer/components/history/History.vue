<template>
  <div class="history clearfix">
    <div class="grid-holder" :class="{'translation-visible': isTranslationVisible}">
      <div class="results-header clearfix">
        <p class="title">Translation History</p>
        <div class="checkbox starred-checkbox">
          <label>
            <span>Starred Only</span> <input type="checkbox" v-model="starredOnly$">
          </label>
        </div>
      </div>
      <div class="translation-results-header" v-if="isTranslationVisible">
        <span class="icon icon-cancel" @click="hideTranslation"></span>
        <p class="title">Translation</p>
      </div>
      <table class="table-striped results non-clickable">
        <thead>
          <tr>
            <sortable-header class="word-column" :sort-column="SortColumn.Input" :current-sort-column.sync="sortColumn$" :current-sort-order.sync="sortOrder$">Word</sortable-header>
            <sortable-header class="translation-column" :sort-column="SortColumn.Translation" :current-sort-column.sync="sortColumn$" :current-sort-order.sync="sortOrder$">Translation</sortable-header>
            <sortable-header class="times-column" :sort-column="SortColumn.TimesTranslated" :current-sort-column.sync="sortColumn$" :current-sort-order.sync="sortOrder$">Times</sortable-header>
            <sortable-header class="last-translated-column" :sort-column="SortColumn.LastTranslatedDate" :current-sort-column.sync="sortColumn$" :current-sort-order.sync="sortOrder$">Last Translated</sortable-header>
          </tr>
        </thead>
        <tbody v-if="historyRecords.length !== 0">
          <tr v-for="record in historyRecords" :key="record.sentence" @click="translateText(record.sentence)">
            <td class="word-column" v-overflow-tooltip>
              <span class="icon icon-star" v-if="record.isStarred" @click.stop="setStarredStatus({record: record, isStarred: false})"></span>
              <span class="icon icon-star-empty" v-else @click.stop="setStarredStatus({record: record, isStarred: true})"></span>
              {{record.sentence}}
            </td>
            <td class="translation-column" v-overflow-tooltip>
              <span v-if="!!record.translateResult.sentence.translation">{{record.translateResult.sentence.translation}}</span>
              <span v-else class="no-translation">No Translation</span>
            </td>
            <td class="times-column">{{record.translationsNumber}}</td>
            <td class="last-translated-column" v-overflow-tooltip>{{record.lastTranslatedDate | date-time}}</td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="4" class="no-records-available">
              No {{starredOnly ? "Starred": ""}} History Records Avialable
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="isTranslationVisible" class="translation-result-holder">
        <translation-result
              :default-view="defaultView"
              :history-record="translateResultHistoryRecord"
              :is-in-progress="isTranslationInProgress"
              :translation-result-view-settings="translationResultViewSettings"
              :is-embedded="true"
              @translate-suggestion="translateSuggestion"
              @force-translation="forceTranslation"
              @translate-text="translateText"
              @play-text="playText"
              @set-starred-status="setStarredStatus"/>
      </div>
      <div class="results-footer" v-if="totalRecords !== 0">
        <p class="records-count">{{totalRecords}} records</p>
        <paginate
          v-model="pageNumber$"
          :page-count="pageCount"
          :prev-text="'Prev'"
          :next-text="'Next'"
          :container-class="'pagination'"
          :break-view-text="'...'">
        </paginate>
      </div>
    </div>
  </div>
</template>

<script src="./History.ts" lang="ts"></script>
<style src="./History.scss" lang="scss" scoped></style>
