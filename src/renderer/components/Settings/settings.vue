<template>
  <div class="settings">
    <div v-if="!!settings && !!defaultSettings">
      <hotkey-settings
            :hotkey-settings="settings.hotkeys"
            :default-hotkey-settings="defaultSettings.hotkeys"
            @hotkey-input-started="pauseHotkeys"
            @hotkey-input-completed="enableHotkeys"
            @hotkeys-updated="updateHotkeySettings"/>
      <scaling-settings
        :scaling-settings="settings.scaling"
        :scaling-state="scalingState"
        @scaling-settings-updated="updateScalingSettings"
        @scaling-changed="changeScaling"/>
      <play-settings
        :play-settings="settings.play"
        @play-settings-updated="updatePlaySettings"/>
      <language-settings
        :language-settings="settings.language"
        @language-settings-updated="updateLanguageSettings"/>
      <startup-settings
        :is-startup-enabled="isStartupEnabled"
        @set-startup-state="setStartupState"/>
      <link-button @click="openSettingsFile" :text="'Open Settings File'" class="open-file"/>
    </div>
  </div>
</template>

<script src="./Settings.ts" lang="ts"></script>
<style src="./Settings.scss" lang="scss" scoped></style>
