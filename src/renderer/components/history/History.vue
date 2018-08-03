<template>
  <div class="history clearfix">
    <div class="header clearfix">
      <p class="title">Translation History</p>
      <select class="form-control number-selector" v-model="limit$">
        <option v-for="option in limitOptions" v-bind:value="option.value" v-bind:key="option.value">
          {{ option.text }}
        </option>
      </select>
    </div>
    <table class="table-striped results">
      <thead>
        <tr>
          <sortable-header class="word-column" :sort-column="SortColumn.Input" :current-sort-column.sync="sortColumn$" :current-sort-order.sync="sortOrder$">Word</sortable-header>
          <th class="translation-column" >Translation</th>
          <sortable-header class="times-column" :sort-column="SortColumn.TimesTranslated" :current-sort-column.sync="sortColumn$" :current-sort-order.sync="sortOrder$">Times</sortable-header>
          <sortable-header class="last-translated-column" :sort-column="SortColumn.LastTranslatedDate" :current-sort-column.sync="sortColumn$" :current-sort-order.sync="sortOrder$">Last Translated</sortable-header>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in historyRecords" :key="record.sentence" @click="translateWord(record.sentence)">
          <td class="word-column" v-overflow-tooltip>{{record.sentence}}</td>
          <td class="translation-column" v-overflow-tooltip>{{record.translateResult.sentence.translation}}</td>
          <td class="times-column">{{record.translationsNumber}}</td>
          <td class="last-translated-column" v-overflow-tooltip>{{record.lastTranslatedDate | date-time}}</td>
        </tr>
      </tbody>
    </table>
    <p class="footer">Showing {{historyRecords.length}} records</p>
  </div>
</template>

<script src="./History.ts" lang="ts"></script>
<style src="./History.scss" lang="scss" scoped></style>
