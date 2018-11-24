<template>
  <div>
    <div class="form-group inline-form-group">
      <label>Number of records per page:</label>
      <input v-tab-index type="number" min="1" class="form-control" v-model.number.lazy="numberOfRecordsPerPage">
    </div>
    <div class="settings-separator"/>
    <checkbox v-model="currentHistorySettings.isContinuousSyncEnabled" :label="'Enable continuous history sync'" />
    <div class="form-group inline-form-group" v-if="currentHistorySettings.isContinuousSyncEnabled">
      <label>Pull interval (minutes):</label>
      <input v-tab-index type="number" min="1" class="form-control" v-model.number.lazy="syncIntervalMinutes">
    </div>
    <div class="settings-separator"/>
    <checkbox v-model="currentHistorySettings.backupOnApplicationStart" :label="'Backup history database on application start'"/>
    <div class="form-group inline-form-group" v-if="currentHistorySettings.backupOnApplicationStart">
      <label>Number of previous startup backups to keep:</label>
      <input v-tab-index type="number" min="0" class="form-control" v-model.number.lazy="numberOfStartupBackupsToKeep">
    </div>
    <div class="settings-separator"/>
    <checkbox v-model="currentHistorySettings.backupRegularly" :label="'Backup history database regularly after start'"/>
    <div class="form-group inline-form-group" v-if="currentHistorySettings.backupRegularly">
      <label>Backup interval (days):</label>
      <input v-tab-index type="number" min="0" class="form-control" v-model.number.lazy="backupRegularlyIntervalDays">
    </div>
    <div class="form-group inline-form-group" v-if="currentHistorySettings.backupRegularly">
      <label>Number of previous regular backups to keep:</label>
      <input v-tab-index type="number" min="0" class="form-control" v-model.number.lazy="numberOfRegularBackupsToKeep">
    </div>
  </div>
</template>

<script src="./HistorySettings.ts" lang="ts"></script>
<style src="./HistorySettings.scss" lang="scss" scoped></style>