<template>
  <settings-holder :title="'History'">
    <checkbox v-model="currentHistorySettings.isContinuousSyncEnabled" :label="'Enable continuous history sync'" />
    <div class="settings-item interval-item" v-if="currentHistorySettings.isContinuousSyncEnabled">
      <div class="form-group">
        <label>Pull interval (minutes):</label>
        <input v-tab-index type="number" min="1" class="form-control" v-model.lazy="syncIntervalMinutes">
      </div>
    </div>
  </settings-holder>
</template>

<script src="./HistorySettings.ts" lang="ts"></script>
<style src="./HistorySettings.scss" lang="scss" scoped></style>