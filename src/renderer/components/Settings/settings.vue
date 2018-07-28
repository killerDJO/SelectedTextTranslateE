<template>
  <div class="settings">
    <div v-if="settings !== null">
      <hotkey-settings
            :hotkey-settings="settings.hotkeys"
            @hotkey-input-started="pauseHotkeys"
            @hotkey-input-completed="enableHotkeys"
            @hotkeys-updated="updateHotkeySettings"/>
      <scaling-settings 
        :scaling-settings="settings.scaling"
        :scaling-state="scalingState"
        @scaling-settings-updated="updateScalingSettings"
        @scaling-changed="changeScaling"/>
    </div>
  </div>
</template>

<script src="./Settings.ts" lang="ts"></script>
<style src="./Settings.scss" lang="scss" scoped></style>
