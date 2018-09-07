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
      <span class="link-button pull-right" @click="openSettingsFile">Open Settings File</span>
    </div>
  </div>
</template>

<script src="./Settings.ts" lang="ts"></script>
<style src="./Settings.scss" lang="scss" scoped></style>
