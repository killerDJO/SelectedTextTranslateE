<template>
  <div class="history-filter">
    <div class="form-group">
      <label>Input:</label>
      <input v-tab-index type="text" class="form-control" v-model="currentFilter.input">
    </div>
  </div>
</template>

<script src="./HistoryFilter.ts" lang="ts"></script>
<style src="./HistoryFilter.scss" lang="scss" scoped></style>
