<template>
  <div>
    <div class="form-group history-filter-item">
      <label>Word:</label>
      <input v-tab-index type="text" class="form-control" v-model="currentFilter.word">
    </div>
    <div class="form-group history-filter-item">
      <label>Translation:</label>
      <input v-tab-index type="text" class="form-control" v-model="currentFilter.translation">
    </div>
  </div>
</template>

<script src="./HistoryFilter.ts" lang="ts"></script>
<style src="./HistoryFilter.scss" lang="scss" scoped></style>
