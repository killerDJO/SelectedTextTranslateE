<template>
  <div class="settings clearfix">
    <div v-if="!!settings && !!defaultSettings">
      <settings-holder :title="'Hotkeys'">
        <hotkey-settings
          :ref="SettingsGroup.Hotkey"
          :hotkey-settings="settings.hotkeys"
          :default-hotkey-settings="defaultSettings.hotkeys"
          @hotkey-input-started="pauseHotkeys"
          @hotkey-input-completed="enableHotkeys"
          @hotkeys-updated="updateHotkeySettings"/>
      </settings-holder>
      <settings-holder :title="'Scaling'">
        <scaling-settings
          :ref="SettingsGroup.Scaling"
          :scaling-settings="settings.scaling"
          :scaling-state="scalingState"
          @scaling-settings-updated="updateScalingSettings"
          @scaling-changed="changeScaling"/>
      </settings-holder>
      <settings-holder :title="'History'">
        <history-settings
          :ref="SettingsGroup.History"
          :history-settings="settings.history"
          @history-settings-updated="updateHistorySettings"/>
      </settings-holder>
      <settings-holder :title="'Play'">
        <play-settings
          :ref="SettingsGroup.Play"
          :play-settings="settings.play"
          @play-settings-updated="updatePlaySettings"/>
      </settings-holder>
      <settings-holder :title="'Language'">
        <language-settings
          :ref="SettingsGroup.Language"
          :language-settings="settings.language"
          @language-settings-updated="updateLanguageSettings"/>
      </settings-holder>
      <settings-holder :title="'Startup'">
        <startup-settings
          :ref="SettingsGroup.Startup"
          :is-startup-enabled="isStartupEnabled"
          @set-startup-state="setStartupState"/>
       </settings-holder>
      <link-button @click="showResetSettingsModal = true" :text="'Reset to Default'" class="control-button"/>
      <link-button @click="openSettingsFile" :text="'Open Settings File'" class="control-button"/>
      <confirm-modal :show.sync="showResetSettingsModal" @confirm="resetSettings">
        <span slot="header">Are you sure you want to reset all settings?</span>
        <span slot="body">You'll loose all settings (inlcluding manual settings file changes) permanently.</span>
      </confirm-modal>
    </div>
    <div v-else class="loading-settings">
      Loading settings...
    </div>
  </div>
</template>

<script src="./Settings.ts" lang="ts"></script>
<style src="./Settings.scss" lang="scss" scoped></style>
