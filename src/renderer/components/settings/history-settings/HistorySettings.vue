<template>
  <div>
    <checkbox v-model="currentHistorySettings.isContinuousSyncEnabled" :label="'Enable continuous history sync'" />
    <div class="settings-item interval-item" v-if="currentHistorySettings.isContinuousSyncEnabled">
      <div class="form-group">
        <label>Pull interval (minutes):</label>
        <input v-tab-index type="number" min="1" class="form-control" v-model="syncIntervalMinutes">
      </div>
    </div>
    <div class="settings-separator"/>
    <checkbox v-model="currentHistorySettings.backupOnApplicationStart" :label="'Backup history database on application start'"/>
    <div class="form-group inline-form-group" v-if="currentHistorySettings.backupOnApplicationStart">
      <label>Number of previous startup backups to keep:</label>
      <input v-tab-index type="number" min="0" class="form-control" v-model.number="numberOfStartupBackupsToKeep">
    </div>
    <div class="settings-separator"/>
    <checkbox v-model="currentHistorySettings.backupRegularly" :label="'Backup history database regularly after start'"/>
    <div class="form-group inline-form-group" v-if="currentHistorySettings.backupRegularly">
      <label>Backup interval (days):</label>
      <input v-tab-index type="number" min="0" class="form-control" v-model.number="backupRegularlyIntervalDays">
    </div>
    <div class="form-group inline-form-group" v-if="currentHistorySettings.backupRegularly">
      <label>Number of previous regular backups to keep:</label>
      <input v-tab-index type="number" min="0" class="form-control" v-model.number="numberOfRegularBackupsToKeep">
    </div>
  </div>
</template>

<script src="./HistorySettings.ts" lang="ts"></script>
<style src="./HistorySettings.scss" lang="scss" scoped></style>