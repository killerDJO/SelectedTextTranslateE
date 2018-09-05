<template>
  <div class="history clearfix">
    <div class="grid-holder" :class="{'translation-visible': isTranslationVisible}">
      <div class="results-header clearfix">
        <p class="title">Translation History</p>
        <div class="checkbox">
          <label>
            <input type="checkbox" v-model="starredOnly$"> Starred Only
          </label>
        </div>
        <select class="form-control number-selector" v-model="limit$">
          <option v-for="option in limitOptions" v-bind:value="option.value" v-bind:key="option.value">
            {{ option.text }}
          </option>
        </select>
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
        <tbody>
          <tr v-for="record in historyRecords" :key="record.sentence" @click="translateText(record.sentence)">
            <td class="word-column" v-overflow-tooltip>
              <span class="icon icon-star" v-if="record.isStarred" @click.stop="setStarredStatus({record: record, isStarred: false})"></span>
              <span class="icon icon-star-empty" v-else @click.stop="setStarredStatus({record: record, isStarred: true})"></span>
              {{record.sentence}}
            </td>
            <td class="translation-column" v-overflow-tooltip>{{record.translateResult.sentence.translation}}</td>
            <td class="times-column">{{record.translationsNumber}}</td>
            <td class="last-translated-column" v-overflow-tooltip>{{record.lastTranslatedDate | date-time}}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="isTranslationVisible" class="translation-result-holder">
        <translation-result
              :default-view="defaultView"
              :translate-result="translateResult"
              :is-in-progress="isTranslationInProgress"
              :translation-result-view-settings="translationResultViewSettings"
              :is-embedded="true"
              @translate-suggestion="translateSuggestion"
              @force-translation="forceTranslation"
              @translate-text="translateText"
              @play-text="playText"/>
      </div>
      <p class="results-footer">Showing {{historyRecords.length}} records</p>
    </div>
  </div>
</template>

<script src="./History.ts" lang="ts"></script>
<style src="./History.scss" lang="scss" scoped></style>
