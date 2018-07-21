<template>
  <div class="settings">
    <div class="pane-group">
      <div class="pane-sm sidebar">
        <nav class="nav-group">
          <h5 class="nav-group-title">Settings</h5>
          <a class="nav-group-item" :class="{'active': isActiveGroup(SettingsGroup.Scaling)}" @click="setSettingsGroup(SettingsGroup.Scaling)">
            <span class="icon icon-resize-full"></span>
            Scaling
          </a>
          <span class="nav-group-item" :class="{'active': isActiveGroup(SettingsGroup.Hotkeys)}" @click="setSettingsGroup(SettingsGroup.Hotkeys)">
            <span class="icon icon-keyboard"></span>
            Hotkeys
          </span>
        </nav>
      </div>
      <div class="pane" v-if="settings !== null">
        <scaling-settings v-if="isActiveGroup(SettingsGroup.Scaling)" />
        <hotkey-settings v-if="isActiveGroup(SettingsGroup.Hotkeys)" :hotkey-settings="settings.hotkeys" @hotkey-input-started="hotkeyInputStarted" @hotkey-input-completed="hotkeyInputCompleted"/>
      </div>
    </div>
    <footer class="toolbar toolbar-footer">
      <div class="toolbar-actions">
        <button class="btn btn-primary pull-right">
          Save
        </button>
        <button class="btn btn-default pull-right">
          Discard
        </button>
      </div>
    </footer>
  </div>
</template>

<script src="./Settings.ts" lang="ts"></script>
<style src="./Settings.scss" lang="scss" scoped></style>
