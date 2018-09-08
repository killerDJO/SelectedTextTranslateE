<template>
  <settings-holder :title="'Hotkeys'">
    <div class="hotkey-settings">
      <div class="settings-item">
        <div class="header">
          <select class="form-control command-selector" v-model="currentCommandKey">
            <option v-for="command in commands" :value="command.key" :key="command.key">
              {{ command.name }}
            </option>
          </select>
        </div>
        <div v-if="currentCommand !== null" class="hotkeys">
          <div class="global-hotkey-warning" v-show="currentCommand.isGlobal">
            <span class="icon icon-attention" title="Warning">This hotkey is global and may conflict with hotkeys from other applications.</span>
          </div>
          <table class="table-striped non-clickable hotkeys-list">
            <thead>
              <tr>
                <th class="hotkey-column">Combinations</th>
                <th class="action-column"></th>
              </tr>
            </thead>
            <tbody>
              <tr class="hotkey" v-for="hotkey in currentCommand.hotkeys" :key="createHotkeyString(hotkey)">
                <td class="hotkey-column">{{createHotkeyString(hotkey)}}</td>
                <td class="action-column"><icon-button class="remove-hotkey" title="Remove hotkey" @click="removeHotkey(hotkey)"><i class="icon icon-cancel"/></icon-button></td>
              </tr>
              <tr v-if="currentCommand.hotkeys.length === 0">
                <td colspan="2" class="no-hotkeys">
                  No combinations assigned
                </td>
              </tr>
            </tbody>
          </table>
          <div class="hotkey-edit">
            <validated-field :validation-message="currentHotkeyValidationMessage" class="hotkey-input-control">
              <hotkey-input :hotkey.sync="currentHotkey" @input-started="hotkeyInputStarted" @input-completed="hotkeyInputCompleted"/>
            </validated-field>
            <app-button class="add-hotkey" @click="addHotkey" :disabled="!isAddHotkeyEnabled" :text="'Add'" />
          </div>
        </div>
      </div>
      <div class="settings-separator"/>
      <link-button @click="showResetHotkeysModal = true" class="reset-hotkeys" :text="'Reset Hotkey Settings'" />
      <confirm-modal :show.sync="showResetHotkeysModal" @confirm="resetHotkeySettings">
        <span slot="header">Are you sure you want to reset hotkeys?</span>
        <span slot="body">You'll loose all your current hotkeys settings permanently.</span>
      </confirm-modal>
    </div>
  </settings-holder>
</template>

<script src="./HotkeySettings.ts" lang="ts"></script>
<style src="./HotkeySettings.scss" lang="scss" scoped></style>
