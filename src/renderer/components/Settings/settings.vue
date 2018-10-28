<template>
  <div class="settings">
    <div v-if="!!settings && !!defaultSettings">
      <hotkey-settings
        :ref="SettingsGroup.Hotkey"
        :hotkey-settings="settings.hotkeys"
        :default-hotkey-settings="defaultSettings.hotkeys"
        @hotkey-input-started="pauseHotkeys"
        @hotkey-input-completed="enableHotkeys"
        @hotkeys-updated="updateHotkeySettings"/>
      <scaling-settings
        :ref="SettingsGroup.Scaling"
        :scaling-settings="settings.scaling"
        :scaling-state="scalingState"
        @scaling-settings-updated="updateScalingSettings"
        @scaling-changed="changeScaling"/>
      <history-settings
        :ref="SettingsGroup.History"
        :history-settings="settings.history"
        @history-settings-updated="updateHistorySettings"/>
      <play-settings
        :ref="SettingsGroup.Play"
        :play-settings="settings.play"
        @play-settings-updated="updatePlaySettings"/>
      <language-settings
        :ref="SettingsGroup.Language"
        :language-settings="settings.language"
        @language-settings-updated="updateLanguageSettings"/>
      <startup-settings
        :ref="SettingsGroup.Startup"
        :is-startup-enabled="isStartupEnabled"
        @set-startup-state="setStartupState"/>
      <link-button @click="openSettingsFile" :text="'Open Settings File'" class="open-file"/>
    </div>
  </div>
</template>

<script src="./Settings.ts" lang="ts"></script>
<style src="./Settings.scss" lang="scss" scoped></style>
