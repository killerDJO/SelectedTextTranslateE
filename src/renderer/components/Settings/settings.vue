<template>
  <div class="settings">
    <div class="pane-group">
      <div class="pane-sm sidebar">
        <nav class="nav-group">
          <span class="nav-group-item" :class="{'active': isActiveGroup(SettingsGroup.Scaling)}" @click="setSettingsGroup(SettingsGroup.Scaling)">
            <span class="icon icon-resize-full"></span>
            Scaling
          </span>
          <span class="nav-group-item" :class="{'active': isActiveGroup(SettingsGroup.Hotkeys)}" @click="setSettingsGroup(SettingsGroup.Hotkeys)">
            <span class="icon icon-keyboard"></span>
            Hotkeys
          </span>
        </nav>
      </div>
      <div class="pane" v-if="settings !== null">
        <scaling-settings v-show="isActiveGroup(SettingsGroup.Scaling)" />
        <hotkey-settings v-show="isActiveGroup(SettingsGroup.Hotkeys)" 
              :hotkey-settings="settings.hotkeys"
              @hotkey-input-started="hotkeyInputStarted"
              @hotkey-input-completed="hotkeyInputCompleted"
              @hotkeys-updated="updateHotkeySettings"/>
      </div>
    </div>
  </div>
</template>

<script src="./Settings.ts" lang="ts"></script>
<style src="./Settings.scss" lang="scss" scoped></style>
