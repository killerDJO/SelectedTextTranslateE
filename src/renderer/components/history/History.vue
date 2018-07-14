<template>
  <div class="history clearfix">
    <div class="header">
      <p class="title">Translation History</p>
      <select class="form-control number-selector">
        <option>Last 50</option>
        <option>Last 100</option>
        <option>Last 200</option>
        <option>All</option>
      </select>
    </div>
    <table class="table-striped results">
      <thead>
        <tr>
          <th class="word-column">Word</th>
          <th class="translation-column">Translation</th>
          <th class="times-column">Times</th>
          <th class="last-translated-column">Last Translated</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in historyRecords" :key="record.sentence">
          <td class="word-column" v-overflow-tooltip>{{record.sentence}}</td>
          <td class="translation-column" v-overflow-tooltip>{{record.translateResult.sentence.translation}}</td>
          <td class="times-column">{{record.translationsNumber}}</td>
          <td class="last-translated-column" v-overflow-tooltip>{{record.lastTranslatedDate | date-time}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script src="./History.ts" lang="ts"></script>
<style src="./History.scss" lang="scss" scoped></style>
